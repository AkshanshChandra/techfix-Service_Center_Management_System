import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Wrench, CheckCircle, DollarSign, Clock, Package,
  ArrowRight, TrendingUp, AlertTriangle, Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import { formatCurrency, formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const CATEGORY_COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-secondary-400'];
const DONUT_COLORS = ['#2563eb', '#14b8a6', '#a855f7', '#f59e0b', '#ef4444', '#94a3b8'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useOutletContext();
  const { data: stats, loading, error, reload } = useApi(() => api.dashboardStats(), []);
  const { data: reports } = useApi(() => api.reportsSummary(), []);
  const [counters, setCounters] = useState({ customers: 0, active: 0, completed: 0, revenue: 0 });

  useEffect(() => {
    if (!stats) return;
    const targets = {
      customers: stats.totalCustomers,
      active: stats.activeRepairs,
      completed: stats.completedRepairs,
      revenue: stats.revenue,
    };
    const steps = 40;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        customers: Math.round(targets.customers * progress),
        active: Math.round(targets.active * progress),
        completed: Math.round(targets.completed * progress),
        revenue: Math.round(targets.revenue * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, 1200 / steps);

    return () => clearInterval(timer);
  }, [stats]);

  const monthlyData = (reports?.monthlyRevenue || []).slice(-7).map(m => {
    const [year, month] = m.month.split('-');
    return { month: `${MONTH_LABELS[Number(month) - 1]} '${year.slice(2)}`, revenue: m.revenue, repairs: m.repairs };
  });

  const categoryTotal = (stats?.categoryBreakdown || []).reduce((s, c) => s + c.count, 0) || 1;
  const categoryData = (stats?.categoryBreakdown || []).slice(0, 6).map((c, i) => ({
    label: c.label || 'Uncategorised',
    value: Math.round((c.count / categoryTotal) * 100),
    color: CATEGORY_COLORS[i],
  }));

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Mumbai, Maharashtra
          </p>
        </div>
        <button
          onClick={() => { navigate('/repair-jobs'); addToast('Navigate to Repair Jobs to create a new job', 'info'); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Repair Job
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Customers" value={counters.customers.toLocaleString()} icon={Users} color="blue" delay={0} />
        <StatCard title="Active Repairs" value={counters.active} icon={Wrench} color="purple" delay={1} />
        <StatCard title="Completed" value={counters.completed.toLocaleString()} icon={CheckCircle} color="green" delay={2} />
        <StatCard title="Revenue Collected" value={`₹${(counters.revenue / 1000).toFixed(0)}K`} icon={DollarSign} color="teal" delay={3} />
        <StatCard title="Devices Waiting" value={stats.devicesWaiting} icon={Clock} color="amber" delay={4} />
        <StatCard title="Parts Available" value={stats.partsAvailable} icon={Package} color="blue" delay={5} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Invoiced revenue by month</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {formatCurrency(stats.outstanding)} outstanding
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map(({ month, revenue, repairs }, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
                  ₹{(revenue / 1000).toFixed(0)}K
                </div>
                <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg min-h-[4px] relative group cursor-pointer hover:from-primary-700 hover:to-primary-500 transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {repairs} repairs
                    </div>
                  </motion.div>
                </div>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">{month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
        >
          <div className="mb-5">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Repair Categories</h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Distribution by device type</p>
          </div>
          <div className="space-y-3">
            {categoryData.map(({ label, value, color }, i) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-secondary-700 dark:text-secondary-300">{label}</span>
                  <span className="text-secondary-500 dark:text-secondary-400">{value}%</span>
                </div>
                <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mini donut placeholder */}
          <div className="mt-5 pt-4 border-t border-secondary-100 dark:border-secondary-700">
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  {categoryData.reduce((acc, { value }, i) => {
                    const total = categoryData.reduce((s, d) => s + d.value, 0);
                    const offset = acc.offset;
                    const dashArray = (value / total) * 100;
                    acc.elements.push(
                      <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={DONUT_COLORS[i]}
                        strokeWidth="3.8" strokeDasharray={`${dashArray} ${100 - dashArray}`}
                        strokeDashoffset={-offset} />
                    );
                    acc.offset += dashArray;
                    return acc;
                  }, { elements: [], offset: 25 }).elements}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-secondary-900 dark:text-white">{categoryTotal}</div>
                    <div className="text-xs text-secondary-500">Jobs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Jobs + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-secondary-800 rounded-2xl shadow-card border border-secondary-100 dark:border-secondary-700 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100 dark:border-secondary-700">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Recent Repair Jobs</h3>
            <button
              onClick={() => navigate('/repair-jobs')}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-700/50">
                  {['Job ID', 'Customer', 'Device', 'Technician', 'Status', 'Delivery'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
                {stats.recentJobs.map((job, i) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    onClick={() => navigate(`/repair-jobs/${job.id}`)}
                    className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-primary-600 dark:text-primary-400">{job.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-secondary-900 dark:text-white">{job.customerName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-secondary-700 dark:text-secondary-300 truncate max-w-[120px]">{job.device}</div>
                      <div className="text-xs text-secondary-400 mt-0.5">{job.category}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600 dark:text-secondary-400">{job.technicianName?.split(' ')[0] || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 text-xs text-secondary-500 dark:text-secondary-400">{formatDate(job.estimatedDelivery)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Stock Alerts</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-3">
            {stats.lowStockParts.length === 0 && (
              <p className="text-xs text-secondary-400 py-6 text-center">All parts are sufficiently stocked</p>
            )}
            {stats.lowStockParts.map((part, i) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                onClick={() => navigate('/inventory')}
                className="flex gap-3 items-start cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-700/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${part.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  !
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed line-clamp-2">{part.name}</p>
                  <p className="text-xs text-secondary-400 mt-0.5">
                    {part.stock === 0 ? 'Out of stock' : `${part.stock} left`} · min {part.minStock} · {part.supplier}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
