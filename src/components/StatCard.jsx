import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color, delay = 0 }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600', trend: 'text-blue-500' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-600', text: 'text-teal-600', trend: 'text-teal-500' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-600', trend: 'text-purple-500' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-600', text: 'text-amber-600', trend: 'text-amber-500' },
    green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-600', trend: 'text-green-500' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-600', trend: 'text-red-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 border border-secondary-100 dark:border-secondary-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 font-medium mb-1">{title}</p>
          <p className={`text-2xl font-bold text-secondary-900 dark:text-white mt-1`}>{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </motion.div>
  );
}
