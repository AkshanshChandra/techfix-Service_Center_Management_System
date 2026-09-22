import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Cpu, Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import { deviceCategories } from '../data/constants';
import { formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

export default function Devices() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.devices.list(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

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

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Devices</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{devices.length} registered devices</p>
        </div>
        <button
          onClick={() => addToast('Device registration opened', 'info')}
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
    </div>
  );
}
