import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Cpu, Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import Modal from '../components/Modal';
import { deviceCategories, deviceBrands } from '../data/constants';
import { formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Mobile Phone': '📱', Laptop: '💻', 'Desktop Computer': '🖥️',
  Printer: '🖨️', Tablet: '📟', 'Smart Watch': '⌚', Accessories: '🎧',
};

const emptyForm = {
  customerId: '', name: '', brand: '', category: 'Laptop', model: '',
  serial: '', warranty: 'None', warrantyExpiry: '',
};

export default function Devices() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.devices.list(), []);
  const { data: customers } = useApi(() => api.customers.list(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const statuses = ['All', 'Received', 'Diagnosing', 'Repairing', 'Waiting Parts', 'Quality Check', 'Ready', 'Delivered'];

  const devices = data || [];
  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.brand.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.serial.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || d.category === category;
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAdd = async () => {
    if (!form.customerId || !form.name || !form.brand || !form.serial) {
      addToast('Customer, device name, brand and serial number are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const customer = customers.find((c) => c.id === form.customerId);
      await api.devices.create({
        ...form,
        customer: customer?.name || '',
        icon: CATEGORY_ICONS[form.category] || '📱',
      });
      setShowAdd(false);
      setForm(emptyForm);
      reload();
      addToast('Device registered successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Devices</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{devices.length} registered devices</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Register Device
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by device, brand, customer, or serial..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Category:
          </div>
          {deviceCategories.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? 'bg-primary-600 text-white' : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-primary-300'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Status:
          </div>
          {statuses.slice(0, 6).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-accent-600 text-white' : 'bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:border-accent-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Devices grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border border-secondary-100 dark:border-secondary-700 cursor-pointer transition-all duration-200"
            >
              {/* Device image placeholder */}
              <div className={`${device.color} p-6 flex items-center justify-center h-32 relative`}>
                <span className="text-5xl">{device.icon}</span>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={device.status} size="xs" />
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">{device.name}</h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{device.brand} · {device.category}</p>
                  <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-0.5">{device.model}</p>
                </div>

                <div className="space-y-1.5 text-xs text-secondary-500 dark:text-secondary-400">
                  <div className="flex justify-between">
                    <span>Serial:</span>
                    <span className="font-mono text-secondary-700 dark:text-secondary-300">{device.serial.split('-').slice(-1)[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium text-secondary-700 dark:text-secondary-300 truncate ml-2">{device.customer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Warranty:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${device.warranty === 'Active' ? 'bg-green-100 text-green-700' : 'bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400'}`}>
                      {device.warranty}
                    </span>
                  </div>
                  {device.warranty === 'Active' && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-secondary-600 dark:text-secondary-300">{formatDate(device.warrantyExpiry)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-secondary-400">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No devices found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Register Device Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Device" size="lg">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Customer</label>
            <select value={form.customerId} onChange={setField('customerId')} className={inputClass}>
              <option value="">Select a customer</option>
              {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Device Name</label>
              <input value={form.name} onChange={setField('name')} placeholder="iPhone 15 Pro" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Brand</label>
              <select value={form.brand} onChange={setField('brand')} className={inputClass}>
                <option value="">Select brand</option>
                {deviceBrands.filter(b => b !== 'All').map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Category</label>
              <select value={form.category} onChange={setField('category')} className={inputClass}>
                {deviceCategories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Model</label>
              <input value={form.model} onChange={setField('model')} placeholder="256GB Space Grey" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Serial Number</label>
            <input value={form.serial} onChange={setField('serial')} placeholder="SN-APL-2024-099" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Warranty</label>
              <select value={form.warranty} onChange={setField('warranty')} className={inputClass}>
                {['None', 'Active', 'Expired'].map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Warranty Expiry</label>
              <input type="date" value={form.warrantyExpiry} onChange={setField('warrantyExpiry')} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
