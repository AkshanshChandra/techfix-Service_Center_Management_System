import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, MessageSquare, Moon, Sun, ChevronDown, Zap } from 'lucide-react';

const notifications = [
  { id: 1, title: 'Job J2412 Ready for Pickup', desc: 'iPad Pro 12.9" repair completed', time: '2m ago', type: 'success', unread: true },
  { id: 2, title: 'Low Stock Alert', desc: 'iPad Pro 12.9" Digitizer - only 2 left', time: '15m ago', type: 'warning', unread: true },
  { id: 3, title: 'New Job Received', desc: 'Vikram Singh dropped Lenovo ThinkPad', time: '1h ago', type: 'info', unread: true },
  { id: 4, title: 'Invoice INV-2407 Paid', desc: 'Priya Sharma paid ₹3,776', time: '2h ago', type: 'success', unread: false },
  { id: 5, title: 'GPU Module Out of Stock', desc: 'AMD RX 6800S - Reorder required', time: '3h ago', type: 'error', unread: false },
];

const typeColors = {
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-blue-100 text-blue-600',
  error: 'bg-red-100 text-red-600',
};

export default function Navbar({ onMenuClick, isDark, toggleDark }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-b border-secondary-100 dark:border-secondary-700">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search jobs, customers, devices..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Messages */}
          <button className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-100 dark:border-secondary-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-secondary-100 dark:border-secondary-700 flex items-center justify-between">
                    <h3 className="font-semibold text-secondary-900 dark:text-white">Notifications</h3>
                    <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-secondary-100 dark:divide-secondary-700 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors cursor-pointer ${n.unread ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${typeColors[n.type]}`}>
                            {n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : n.type === 'error' ? '✗' : 'i'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{n.desc}</p>
                            <p className="text-xs text-secondary-400 mt-1">{n.time}</p>
                          </div>
                          {n.unread && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-secondary-100 dark:border-secondary-700 text-center">
                    <button className="text-xs font-medium text-primary-600 hover:underline">View all notifications</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">AK</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-secondary-900 dark:text-white leading-none">Akshansh</p>
                <p className="text-xs text-secondary-400 mt-0.5">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-100 dark:border-secondary-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-secondary-100 dark:border-secondary-700">
                    <p className="font-semibold text-secondary-900 dark:text-white">Akshansh Chandra</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">akshansh@techfix.in</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      <Zap className="w-3 h-3" /> Admin
                    </span>
                  </div>
                  {['My Profile', 'Account Settings', 'Billing', 'Help Center'].map(item => (
                    <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                      {item}
                    </button>
                  ))}
                  <div className="border-t border-secondary-100 dark:border-secondary-700 p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium">
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
