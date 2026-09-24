"""Minimal client for Cashfree's Payment Links API (v2023-08-01).

Docs: https://www.cashfree.com/docs/api-reference/payments/latest/links/create
"""

import base64
import hashlib
import hmac
import re

import httpx

from .config import settings

API_VERSION = "2023-08-01"


class CashfreeError(Exception):
    pass


def _headers() -> dict:
    return {
        "x-client-id": settings.cashfree_app_id,
        "x-client-secret": settings.cashfree_secret_key,
        "x-api-version": API_VERSION,
        "Content-Type": "application/json",
    }


def _require_credentials() -> None:
    if not settings.cashfree_app_id or not settings.cashfree_secret_key:
        raise CashfreeError("Cashfree credentials are not configured on the server (see backend/.env)")


def sanitize_phone(phone: str) -> str:
    """Cashfree wants a bare 10-digit Indian mobile number, no country code or spaces."""
    digits = re.sub(r"\D", "", phone or "")
    return digits[-10:] if len(digits) >= 10 else "9999999999"


async def _request(method: str, path: str, **kwargs) -> dict:
    _require_credentials()
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.request(method, f"{settings.cashfree_base_url}{path}", headers=_headers(), **kwargs)
    if resp.status_code >= 400:
        try:
            detail = resp.json().get("message", resp.text)
        except ValueError:
            detail = resp.text
        raise CashfreeError(detail)
    return resp.json()


async def create_payment_link(
    *,
    link_id: str,
    amount: float,
    purpose: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    return_url: str,
) -> dict:
    payload = {
        "link_id": link_id,
        "link_amount": round(amount, 2),
        "link_currency": "INR",
        "link_purpose": purpose[:190] or "TechFix service invoice",
        "customer_details": {
            "customer_name": customer_name or "Customer",
            "customer_email": customer_email,
            "customer_phone": sanitize_phone(customer_phone),
        },
        "link_notify": {"send_email": True, "send_sms": False},
        "link_meta": {"return_url": return_url},
    }
    return await _request("POST", "/links", json=payload)


async def get_payment_link(link_id: str) -> dict:
    return await _request("GET", f"/links/{link_id}")


async def cancel_payment_link(link_id: str) -> dict:
    return await _request("POST", f"/links/{link_id}/cancel")


def verify_webhook_signature(raw_body: bytes, timestamp: str, signature: str) -> bool:
    """Cashfree signs webhooks as base64(HMAC-SHA256(secret, timestamp + raw_body))."""
    if not settings.cashfree_secret_key or not timestamp or not signature:
        return False
    signed_payload = f"{timestamp}{raw_body.decode('utf-8')}".encode()
    computed = base64.b64encode(
        hmac.new(settings.cashfree_secret_key.encode(), signed_payload, hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(computed, signature)
