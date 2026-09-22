import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Package, AlertTriangle, Plus, TrendingDown } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import { categories } from '../data/constants';
import { formatCurrency } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

export default function Inventory() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.inventory.list(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Available', 'Low Stock', 'Out of Stock'];

  const inventory = data || [];
  const filtered = inventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || item.category === category;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalValue = inventory.reduce((s, i) => s + i.stock * i.price, 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'Out of Stock').length;

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{inventory.length} parts catalogued</p>
        </div>
        <button
          onClick={() => addToast('Part added to inventory', 'success')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Parts', value: inventory.length, icon: Package, color: 'text-primary-600 bg-primary-50' },
          { label: 'Inventory Value', value: formatCurrency(totalValue), icon: TrendingDown, color: 'text-green-600 bg-green-50' },
          { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Out of Stock', value: outOfStockCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Inventory Alert</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              {lowStockCount} parts below minimum stock level · {outOfStockCount} parts completely out of stock. Reorder recommended.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search parts, suppliers, SKU..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 transition-all"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-card border border-secondary-100 dark:border-secondary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-700/50 border-b border-secondary-100 dark:border-secondary-700">
                {['Part Name', 'Category', 'SKU', 'Stock', 'Min Stock', 'Stock Level', 'Supplier', 'Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {filtered.map((item, i) => {
                const stockPct = Math.min(100, (item.stock / (item.minStock * 3)) * 100);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-secondary-400 mt-0.5">{item.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 px-2.5 py-1 rounded-full font-medium">{item.category}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-secondary-500 dark:text-secondary-400">{item.sku}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : item.stock <= item.minStock ? 'text-amber-500' : 'text-secondary-900 dark:text-white'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-secondary-500 dark:text-secondary-400">{item.minStock}</td>
                    <td className="px-4 py-3.5">
                      <div className="w-24">
                        <div className="h-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stockPct}%` }}
                            transition={{ delay: i * 0.03 + 0.3, duration: 0.6 }}
                            className={`h-full rounded-full ${item.stock === 0 ? 'bg-red-500' : item.stock <= item.minStock ? 'bg-amber-500' : 'bg-green-500'}`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-secondary-600 dark:text-secondary-400 max-w-[140px] truncate">{item.supplier}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-secondary-900 dark:text-white whitespace-nowrap">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={item.status} size="xs" /></td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => addToast(`Restock order placed for ${item.name}`, 'success')}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap"
                      >
                        Reorder
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-secondary-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No parts found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
