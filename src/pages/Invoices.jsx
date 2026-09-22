import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Printer, FileText, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import { formatCurrency, formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

const paymentMethodIcons = { UPI: '📱', Cash: '💵', Card: '💳', Pending: '⏳' };

export default function Invoices() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.invoices.list(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const markPaid = async (id) => {
    try {
      await api.invoices.update(id, { status: 'Paid', method: 'UPI' });
      reload();
      addToast(`${id} marked as paid`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

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
          onClick={() => addToast('Invoice created', 'success')}
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

            {/* Actions */}
            <div className="flex gap-2">
              {inv.status !== 'Paid' && (
                <button
                  onClick={() => markPaid(inv.id)}
                  className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Mark Paid
                </button>
              )}
              <button
                onClick={() => addToast('Invoice downloaded (demo)', 'info')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs font-medium rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => addToast('Sending to printer...', 'info')}
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
    </div>
  );
}
