import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Cpu, Wrench, UserCheck,
  Package, FileText, BarChart3, Settings, Zap, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/repair-jobs', label: 'Repair Jobs', icon: Wrench },
  { to: '/technicians', label: 'Technicians', icon: UserCheck },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-secondary-100 dark:border-secondary-700">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-secondary-900 dark:text-white">TechFix</span>
          <p className="text-xs text-secondary-400 -mt-0.5">Service Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
        {navItems.slice(0, 6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-600 rounded-r"
                  />
                )}
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 group-hover:text-secondary-600 dark:group-hover:text-secondary-300'}`} style={{ width: '18px', height: '18px' }} />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />}
              </>
            )}
          </NavLink>
        ))}

        <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider px-3 mb-3 mt-5">Management</p>
        {navItems.slice(6).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav2"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-600 rounded-r"
                  />
                )}
                <Icon className={`flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 group-hover:text-secondary-600 dark:group-hover:text-secondary-300'}`} style={{ width: '18px', height: '18px' }} />
                <span>{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-3">
          <p className="text-xs font-semibold text-secondary-800 dark:text-secondary-200">Need Help?</p>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Contact support or view docs</p>
          <button className="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
            View Documentation →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-secondary-900 border-r border-secondary-100 dark:border-secondary-700 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-secondary-900/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-secondary-900 z-50 lg:hidden shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-400"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
