const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`/api${path}`, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '' && value !== 'All') url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const crud = (resource) => ({
  list: (params) => request(`/${resource}`, { params }),
  get: (id) => request(`/${resource}/${id}`),
  create: (body) => request(`/${resource}`, { method: 'POST', body }),
  update: (id, body) => request(`/${resource}/${id}`, { method: 'PUT', body }),
  remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
});

export const api = {
  customers: crud('customers'),
  devices: crud('devices'),
  technicians: crud('technicians'),
  invoices: crud('invoices'),

  repairJobs: {
    ...crud('repair-jobs'),
    setStatus: (id, status) =>
      request(`/repair-jobs/${id}/status`, { method: 'PATCH', body: { status } }),
  },

  inventory: {
    ...crud('inventory'),
    lowStock: () => request('/inventory/low-stock'),
    adjustStock: (id, delta) =>
      request(`/inventory/${id}/stock`, { method: 'PATCH', body: { delta } }),
  },

  dashboardStats: () => request('/dashboard/stats'),
  reportsSummary: () => request('/reports/summary'),
  health: () => request('/health'),
};
