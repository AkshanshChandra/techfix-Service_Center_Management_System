import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, X, Phone, Mail, MapPin, Star, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AsyncState from '../components/AsyncState';
import { formatCurrency, formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

const emptyForm = { firstName: '', lastName: '', phone: '', email: '', address: '' };

export default function Customers() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.customers.list(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const statuses = ['All', 'Active', 'Inactive', 'VIP'];

  const customers = data || [];
  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = async () => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    if (!name || !form.email || !form.phone) {
      addToast('Name, email and phone are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.customers.create({
        name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        joinDate: new Date().toISOString().slice(0, 10),
      });
      setShowAdd(false);
      setForm(emptyForm);
      reload();
      addToast('Customer added successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Customers</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                statusFilter === s
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-primary-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Customers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => { setSelected(customer); setActiveTab('history'); }}
              className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-secondary-100 dark:border-secondary-700 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 ${customer.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {customer.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{customer.id}</p>
                  </div>
                </div>
                <StatusBadge status={customer.status} size="xs" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-secondary-900 dark:text-white">{customer.totalRepairs}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Repairs</p>
                </div>
                <div className="text-center max-w-[120px]">
                  <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300 truncate">{customer.currentDevice}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Current Device</p>
                </div>
                <div className="text-center">
                  <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${customer.warranty.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-500'}`}>
                    {customer.warranty.status}
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Warranty</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-secondary-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No customers found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Customer Profile Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-secondary-900/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-secondary-900 z-50 shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white dark:bg-secondary-900 border-b border-secondary-100 dark:border-secondary-700 p-5 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 ${selected.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg`}>
                      {selected.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-secondary-900 dark:text-white">{selected.name}</h2>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">{selected.id} · Since {formatDate(selected.joinDate)}</p>
                      <StatusBadge status={selected.status} size="xs" />
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Contact */}
                <div className="bg-secondary-50 dark:bg-secondary-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">Contact Details</h3>
                  {[
                    { icon: Phone, text: selected.phone },
                    { icon: Mail, text: selected.email },
                    { icon: MapPin, text: selected.address },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex gap-3">
                      <Icon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-secondary-700 dark:text-secondary-300">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Repairs', value: selected.totalRepairs },
                    { label: 'Warranty', value: selected.warranty.status },
                    { label: 'Status', value: selected.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-3 text-center">
                      <p className="text-base font-bold text-secondary-900 dark:text-white">{value}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Warranty */}
                <div className={`rounded-xl p-4 border ${selected.warranty.status === 'Active' ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800' : 'bg-secondary-50 border-secondary-100 dark:bg-secondary-800 dark:border-secondary-700'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className={`w-4 h-4 ${selected.warranty.status === 'Active' ? 'text-green-500' : 'text-secondary-400'}`} />
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">Warranty</span>
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">{selected.warranty.coverage}</p>
                  {selected.warranty.expires && (
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Expires: {formatDate(selected.warranty.expires)}</p>
                  )}
                </div>

                {/* Tabs */}
                <div>
                  <div className="flex gap-1 bg-secondary-100 dark:bg-secondary-800 rounded-xl p-1 mb-4">
                    {[{ id: 'history', label: 'Repair History' }, { id: 'invoices', label: 'Invoices' }].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm' : 'text-secondary-500 dark:text-secondary-400'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'history' && (
                    <div className="space-y-2">
                      {selected.repairHistory.length === 0 ? (
                        <p className="text-sm text-secondary-400 text-center py-6">No repair history</p>
                      ) : selected.repairHistory.map(repair => (
                        <div key={repair.id} className="flex items-start justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl border border-secondary-100 dark:border-secondary-700">
                          <div>
                            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">{repair.id}</p>
                            <p className="text-sm text-secondary-700 dark:text-secondary-300 mt-0.5">{repair.device}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">{repair.issue}</p>
                            <p className="text-xs text-secondary-400 mt-1">{formatDate(repair.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-secondary-900 dark:text-white">{formatCurrency(repair.cost)}</p>
                            <StatusBadge status={repair.status} size="xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'invoices' && (
                    <div className="space-y-2">
                      {selected.invoices.length === 0 ? (
                        <p className="text-sm text-secondary-400 text-center py-6">No invoices</p>
                      ) : selected.invoices.map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl border border-secondary-100 dark:border-secondary-700">
                          <div>
                            <p className="text-sm font-semibold text-secondary-900 dark:text-white">{inv.id}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(inv.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-secondary-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                            <StatusBadge status={inv.status} size="xs" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { addToast(`Repair job created for ${selected.name}`, 'success'); setSelected(null); }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all"
                  >
                    New Repair Job
                  </button>
                  <button
                    onClick={() => { addToast('Invoice generated', 'success'); }}
                    className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { field: 'firstName', label: 'First Name', placeholder: 'Rahul' },
              { field: 'lastName', label: 'Last Name', placeholder: 'Sharma' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">{label}</label>
                <input value={form[field]} onChange={setField(field)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
              </div>
            ))}
          </div>
          {[
            { field: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
            { field: 'email', label: 'Email Address', placeholder: 'customer@email.com', type: 'email' },
            { field: 'address', label: 'Address', placeholder: 'Full address with city and pincode' },
          ].map(({ field, label, placeholder, type = 'text' }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">{label}</label>
              <input type={type} value={form[field]} onChange={setField(field)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
