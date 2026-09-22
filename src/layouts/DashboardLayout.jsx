import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useDarkMode } from '../hooks/useDarkMode';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          isDark={isDark}
          toggleDark={toggleDark}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ addToast }} />
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
