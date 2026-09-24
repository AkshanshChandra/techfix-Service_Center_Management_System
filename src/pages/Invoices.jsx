import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Printer, FileText, Link2, RefreshCw, Copy, IndianRupee } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import Modal from '../components/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { downloadInvoicePdf, printInvoicePdf } from '../utils/invoicePdf';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

const paymentMethodIcons = { UPI: '📱', Cash: '💵', Card: '💳', Pending: '⏳', 'Online (Cashfree)': '🔗' };

export default function Invoices() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.invoices.list(), []);
  const { data: jobs } = useApi(() => api.repairJobs.list(), []);
  const { data: customers } = useApi(() => api.customers.list(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const [linkInvoice, setLinkInvoice] = useState(null);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const statuses = ['All', 'Paid', 'Pending', 'Overdue'];

  const invoices = data || [];
  const filtered = invoices.filter(inv => {
    const matchSearch = inv.customer.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.device.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.total, 0);

  const activeLinkIds = invoices.filter(i => i.paymentLinkStatus === 'ACTIVE').map(i => i.id);
  const activeLinkIdsKey = activeLinkIds.join(',');
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  // While any invoice has a payment link out, poll Cashfree so the portal reflects
  // payment without needing a public webhook URL during local development.
  useEffect(() => {
    if (activeLinkIds.length === 0) return undefined;
    const interval = setInterval(async () => {
      const results = await Promise.all(
        activeLinkIds.map((id) => api.invoices.syncPaymentLink(id).catch(() => null))
      );
      if (results.some((r) => r?.status === 'Paid')) reloadRef.current();
    }, 12000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLinkIdsKey]);

  const markPaidCash = async (id) => {
    try {
      await api.invoices.update(id, { status: 'Paid', method: 'Cash' });
      reload();
      addToast(`${id} marked as paid (cash)`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openSendLink = (inv) => {
    const customer = (customers || []).find((c) => c.id === inv.customerId);
    setLinkInvoice(inv);
    setLinkEmail(customer?.email || '');
    setLinkPhone(customer?.phone || '');
  };

  const handleSendLink = async () => {
    if (!linkEmail) {
      addToast('Customer email is required to send a payment link', 'error');
      return;
    }
    setSendingLink(true);
    try {
      await api.invoices.createPaymentLink(linkInvoice.id, { email: linkEmail, phone: linkPhone });
      setLinkInvoice(null);
      reload();
      addToast(`Payment link sent to ${linkEmail}`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSendingLink(false);
    }
  };

  const syncLink = async (inv) => {
    setSyncingId(inv.id);
    try {
      const updated = await api.invoices.syncPaymentLink(inv.id);
      reload();
      if (updated.status === 'Paid') addToast(`${inv.id} paid online — invoice updated`, 'success');
      else addToast('Still waiting on payment', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('Payment link copied', 'success');
    } catch {
      addToast('Could not copy — select and copy the link manually', 'error');
    }
  };

  const invoicedJobIds = new Set(invoices.map(i => i.jobId));
  const invoiceableJobs = (jobs || []).filter(j => !invoicedJobIds.has(j.id));

  const openCreate = () => {
    setJobId('');
    setAmount('');
    setShowCreate(true);
  };

  const selectJob = (id) => {
    setJobId(id);
    const job = invoiceableJobs.find(j => j.id === id);
    setAmount(job ? String(job.cost) : '');
  };

  const handleCreate = async () => {
    const job = invoiceableJobs.find(j => j.id === jobId);
    if (!job || !amount) {
      addToast('Select a repair job and enter an amount', 'error');
      return;
    }
    setSaving(true);
    try {
      const invoice = await api.invoices.create({
        jobId: job.id,
        customerId: job.customerId,
        amount: Number(amount),
      });
      setShowCreate(false);
      reload();
      addToast(`Invoice ${invoice.id} created`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{invoices.length} invoices total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <FileText className="w-4 h-4" /> Create Invoice
        </button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: formatCurrency(totalRevenue), color: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800', textColor: 'text-green-700 dark:text-green-400' },
          { label: 'Pending Payment', value: formatCurrency(pendingRevenue), color: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800', textColor: 'text-amber-700 dark:text-amber-400' },
          { label: 'Total Invoices', value: invoices.length, color: 'bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800', textColor: 'text-primary-700 dark:text-primary-400' },
        ].map(({ label, value, color, textColor }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-2xl p-5 border ${color}`}
          >
            <p className="text-sm text-secondary-500 dark:text-secondary-400 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, invoice number, or device..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${statusFilter === s ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-primary-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-secondary-100 dark:border-secondary-700 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{inv.id}</span>
                  <StatusBadge status={inv.status} size="xs" />
                </div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(inv.date)}</p>
              </div>
              <span className="text-2xl">{paymentMethodIcons[inv.method]}</span>
            </div>

            {/* Customer & Device */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {inv.customer.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-sm font-semibold text-secondary-900 dark:text-white">{inv.customer}</span>
              </div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 pl-9">{inv.device}</p>
              <p className="text-xs text-secondary-400 dark:text-secondary-500 pl-9 truncate">{inv.service}</p>
            </div>

            {/* Amount breakdown */}
            <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-3 mb-4 space-y-1.5">
              <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400">
                <span>Subtotal</span>
                <span>{formatCurrency(inv.amount)}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400">
                <span>GST (18%)</span>
                <span>{formatCurrency(inv.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-secondary-900 dark:text-white border-t border-secondary-200 dark:border-secondary-600 pt-1.5">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">{formatCurrency(inv.total)}</span>
              </div>
            </div>

            {/* Payment method & Due date */}
            <div className="flex justify-between items-center mb-4 text-xs">
              <div>
                <span className="text-secondary-400">Method: </span>
                <span className="font-medium text-secondary-700 dark:text-secondary-300">{inv.method}</span>
              </div>
              <div>
                <span className="text-secondary-400">Due: </span>
                <span className="font-medium text-secondary-700 dark:text-secondary-300">{formatDate(inv.dueDate)}</span>
              </div>
            </div>

            {/* Payment actions */}
            {inv.status !== 'Paid' && (
              <div className="space-y-2 mb-2">
                {inv.paymentLinkStatus === 'ACTIVE' ? (
                  <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-primary-700 dark:text-primary-300">Payment link sent</span>
                      <button
                        onClick={() => syncLink(inv)}
                        disabled={syncingId === inv.id}
                        className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingId === inv.id ? 'animate-spin' : ''}`} /> Check status
                      </button>
                    </div>
                    <p className="text-primary-600 dark:text-primary-400 truncate">{inv.customerEmail}</p>
                    <button
                      onClick={() => copyLink(inv.paymentLinkUrl)}
                      className="mt-1 flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Copy className="w-3 h-3" /> Copy link
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openSendLink(inv)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" /> Send Payment Link
                  </button>
                )}
                <button
                  onClick={() => markPaidCash(inv.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  <IndianRupee className="w-3.5 h-3.5" /> Mark Paid (Cash)
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { downloadInvoicePdf(inv); addToast('Invoice PDF downloaded', 'success'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs font-medium rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => {
                  if (!printInvoicePdf(inv)) addToast('Allow pop-ups for this site to print', 'error');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs font-medium rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-secondary-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No invoices found</p>
        </div>
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Repair Job</label>
            <select value={jobId} onChange={e => selectJob(e.target.value)} className={inputClass}>
              <option value="">Select a repair job</option>
              {invoiceableJobs.map(j => (
                <option key={j.id} value={j.id}>{j.id} — {j.customerName} — {j.device}</option>
              ))}
            </select>
            {invoiceableJobs.length === 0 && (
              <p className="text-xs text-secondary-400 mt-1.5">Every repair job already has an invoice.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Amount (₹)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className={inputClass} />
            <p className="text-xs text-secondary-400 mt-1.5">18% GST is added automatically.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={saving || !jobId}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Payment Link Modal */}
      <Modal isOpen={!!linkInvoice} onClose={() => setLinkInvoice(null)} title="Send Payment Link">
        <div className="p-6 space-y-4">
          {linkInvoice && (
            <div className="rounded-xl bg-secondary-50 dark:bg-secondary-700/50 p-3 text-sm">
              <p className="font-semibold text-secondary-900 dark:text-white">{linkInvoice.id} · {linkInvoice.customer}</p>
              <p className="text-secondary-500 dark:text-secondary-400 mt-0.5">{formatCurrency(linkInvoice.total)} due {formatDate(linkInvoice.dueDate)}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Customer Email</label>
            <input type="email" value={linkEmail} onChange={e => setLinkEmail(e.target.value)} placeholder="customer@email.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Phone (for Cashfree records)</label>
            <input type="tel" value={linkPhone} onChange={e => setLinkPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
          </div>
          <p className="text-xs text-secondary-400">Cashfree emails the customer a secure payment link. This invoice updates to Paid automatically once they complete it.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setLinkInvoice(null)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleSendLink}
              disabled={sendingLink}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {sendingLink ? 'Sending...' : 'Send Link'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
