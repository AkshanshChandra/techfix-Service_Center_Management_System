import { motion } from 'framer-motion';
import { TrendingUp, Wrench, Clock, Star, Download } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import AsyncState from '../components/AsyncState';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const CATEGORY_COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-secondary-400'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthLabel = (key) => {
  const [year, month] = key.split('-');
  return `${MONTH_LABELS[Number(month) - 1]} ${year}`;
};

export default function Reports() {
  const { data, loading, error, reload } = useApi(() => api.reportsSummary(), []);

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  const monthlyRevenue = data.monthlyRevenue.slice(-6).map(m => ({ ...m, month: monthLabel(m.month) }));
  const technicians = data.technicianPerformance;

  const categoryTotal = data.categoryRepairs.reduce((s, c) => s + c.count, 0) || 1;
  const categoryRepairs = data.categoryRepairs.slice(0, 6).map((c, i) => ({
    label: c.label || 'Uncategorised',
    count: c.count,
    pct: Math.round((c.count / categoryTotal) * 100),
    color: CATEGORY_COLORS[i],
  }));

  const maxRevenue = Math.max(...monthlyRevenue.map(d => d.revenue), 1);
  const maxRepairs = Math.max(...monthlyRevenue.map(d => d.repairs), 1);

  const latest = monthlyRevenue[monthlyRevenue.length - 1] || { revenue: 0, repairs: 0 };
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Live business insights from your service data</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), trend: `${monthlyRevenue.length} mo`, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Repair Jobs', value: String(data.totalJobs), trend: 'all time', icon: Wrench, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Latest Month Revenue', value: formatCurrency(latest.revenue), trend: `${latest.repairs} invoices`, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Technician Rating', value: `${data.averageRating} / 5.0`, trend: `${technicians.length} staff`, icon: Star, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ label, value, trend, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{label}</p>
            <p className="text-xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white">Monthly Revenue</h3>
              <p className="text-xs text-secondary-500 mt-0.5">Invoiced revenue by month</p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-44">
            {monthlyRevenue.map(({ month, revenue }, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">₹{(revenue / 1000).toFixed(0)}K</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-primary-700 to-primary-400 rounded-t-lg hover:from-primary-800 hover:to-primary-500 transition-colors cursor-pointer"
                  />
                </div>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">{month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Repairs chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white">Monthly Repairs</h3>
              <p className="text-xs text-secondary-500 mt-0.5">Invoices raised per month</p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-44">
            {monthlyRevenue.map(({ month, repairs }, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{repairs}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '120px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(repairs / maxRepairs) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-accent-700 to-accent-400 rounded-t-lg hover:from-accent-800 hover:to-accent-500 transition-colors cursor-pointer"
                  />
                </div>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">{month}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Device categories + Technician performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Device categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Repair by Device Category</h3>
          <div className="space-y-4">
            {categoryRepairs.map(({ label, count, pct, color }, i) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">{count} repairs</span>
                    <span className="text-xs font-bold text-secondary-900 dark:text-white w-10 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technician performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
          <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Technician Performance</h3>
          <div className="space-y-4">
            {technicians.map((tech, i) => (
              <div key={tech.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 ${tech.avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {tech.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 truncate">{tech.name}</span>
                    <span className="text-xs font-bold text-secondary-900 dark:text-white ml-2">{tech.efficiency}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tech.efficiency}%` }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                      className={`h-full rounded-full ${tech.efficiency >= 95 ? 'bg-green-500' : tech.efficiency >= 90 ? 'bg-primary-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-secondary-900 dark:text-white">{tech.completedJobs}</p>
                  <p className="text-xs text-secondary-400">jobs</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly trends table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl shadow-card border border-secondary-100 dark:border-secondary-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-secondary-100 dark:border-secondary-700">
          <h3 className="font-semibold text-secondary-900 dark:text-white">Monthly Summary</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50 dark:bg-secondary-700/50">
              {['Month', 'Invoices', 'Revenue', 'Avg per Repair', 'Growth'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
            {monthlyRevenue.map(({ month, revenue, repairs }, i) => {
              const prev = monthlyRevenue[i - 1];
              const growth = prev ? (((revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
              return (
                <motion.tr
                  key={month}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold text-secondary-900 dark:text-white">{month}</td>
                  <td className="px-4 py-3.5 text-sm text-secondary-700 dark:text-secondary-300">{repairs}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-secondary-900 dark:text-white">{formatCurrency(revenue)}</td>
                  <td className="px-4 py-3.5 text-sm text-secondary-600 dark:text-secondary-400">{formatCurrency(Math.round(revenue / repairs))}</td>
                  <td className="px-4 py-3.5">
                    {growth !== null ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${parseFloat(growth) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                      </span>
                    ) : <span className="text-xs text-secondary-400">—</span>}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
