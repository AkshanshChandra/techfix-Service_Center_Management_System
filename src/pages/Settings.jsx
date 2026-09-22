import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Clock, Bell, Palette, Database, Shield,
  Save, Check, Eye, EyeOff, Upload
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const tabs = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'hours', label: 'Business Hours', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'backup', label: 'Backup', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
];

const businessHours = [
  { day: 'Monday', open: '09:00', close: '19:00', isOpen: true },
  { day: 'Tuesday', open: '09:00', close: '19:00', isOpen: true },
  { day: 'Wednesday', open: '09:00', close: '19:00', isOpen: true },
  { day: 'Thursday', open: '09:00', close: '19:00', isOpen: true },
  { day: 'Friday', open: '09:00', close: '19:00', isOpen: true },
  { day: 'Saturday', open: '10:00', close: '17:00', isOpen: true },
  { day: 'Sunday', open: '', close: '', isOpen: false },
];

export default function Settings() {
  const { addToast } = useOutletContext();
  const [activeTab, setActiveTab] = useState('company');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    newJob: true, jobReady: true, lowStock: true, invoicePaid: true,
    smsAlerts: false, emailReports: true, weeklyDigest: false,
  });
  const [hours, setHours] = useState(businessHours);

  const handleSave = () => addToast('Settings saved successfully!', 'success');

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Settings</h1>
        <p className="text-sm text-secondary-500 mt-0.5">Manage your TechFix system preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl p-2 shadow-card border border-secondary-100 dark:border-secondary-700">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white dark:bg-secondary-800 rounded-2xl p-6 shadow-card border border-secondary-100 dark:border-secondary-700"
        >
          {/* Company Profile */}
          {activeTab === 'company' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Company Profile</h2>
              <div className="flex items-center gap-4 p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">TF</div>
                <div>
                  <p className="font-semibold text-secondary-900 dark:text-white">TechFix Service Center</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">Mumbai, Maharashtra</p>
                  <button className="mt-1.5 flex items-center gap-1.5 text-xs text-primary-600 hover:underline font-medium">
                    <Upload className="w-3 h-3" /> Change Logo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Business Name', value: 'TechFix Service Center' },
                  { label: 'GST Number', value: '27AABCU9603R1ZX' },
                  { label: 'Phone', value: '+91 98765 00000' },
                  { label: 'Email', value: 'contact@techfix.in' },
                  { label: 'Website', value: 'www.techfix.in' },
                  { label: 'Pincode', value: '400053' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input defaultValue={value} className="w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm text-secondary-800 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1.5 uppercase tracking-wide">Address</label>
                <textarea defaultValue="42, Lotus Colony, Andheri West, Mumbai - 400053, Maharashtra, India" rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm text-secondary-800 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none transition-all" />
              </div>
            </div>
          )}

          {/* Business Hours */}
          {activeTab === 'hours' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Business Hours</h2>
              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-secondary-700 dark:text-secondary-300">{h.day}</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={h.isOpen} onChange={() => setHours(prev => prev.map((d, j) => j === i ? { ...d, isOpen: !d.isOpen } : d))} className="sr-only peer" />
                      <div className="w-10 h-5 bg-secondary-200 peer-focus:ring-2 peer-focus:ring-primary-500/30 dark:bg-secondary-600 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    {h.isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" defaultValue={h.open} className="px-2 py-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                        <span className="text-secondary-400 text-sm">to</span>
                        <input type="time" defaultValue={h.close} className="px-2 py-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                      </div>
                    ) : (
                      <span className="text-sm text-secondary-400 italic">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-3">
                {[
                  { key: 'newJob', label: 'New Repair Job', desc: 'Notify when a new job is received' },
                  { key: 'jobReady', label: 'Job Ready for Pickup', desc: 'Notify customer when repair is complete' },
                  { key: 'lowStock', label: 'Low Inventory Alert', desc: 'Alert when parts fall below minimum stock' },
                  { key: 'invoicePaid', label: 'Invoice Paid', desc: 'Notify when customer makes a payment' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Send SMS notifications (additional charges may apply)' },
                  { key: 'emailReports', label: 'Email Reports', desc: 'Send daily repair summary emails' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive weekly analytics summary' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{label}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                      <input type="checkbox" checked={notifications[key]} onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} className="sr-only peer" />
                      <div className="w-10 h-5 bg-secondary-200 dark:bg-secondary-600 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Theme & Appearance</h2>
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">Color Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Blue (Default)', primary: 'bg-blue-600', secondary: 'bg-blue-100', active: true },
                    { name: 'Teal', primary: 'bg-teal-600', secondary: 'bg-teal-100', active: false },
                    { name: 'Purple', primary: 'bg-purple-600', secondary: 'bg-purple-100', active: false },
                  ].map(({ name, primary, secondary, active }) => (
                    <div key={name} onClick={() => addToast(`Theme "${name}" applied`, 'success')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${active ? 'border-primary-500' : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'}`}>
                      <div className="flex gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-lg ${primary}`} />
                        <div className={`w-6 h-6 rounded-lg ${secondary}`} />
                      </div>
                      <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300">{name}</p>
                      {active && <p className="text-xs text-primary-600 mt-0.5 font-semibold">Active</p>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">Display Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Light Mode', icon: '☀️' },
                    { name: 'Dark Mode', icon: '🌙' },
                  ].map(({ name, icon }) => (
                    <div key={name} onClick={() => addToast(`Use the moon icon in the navbar to toggle dark mode`, 'info')}
                      className="p-4 rounded-xl border-2 border-secondary-200 dark:border-secondary-700 cursor-pointer hover:border-primary-300 transition-all text-center">
                      <span className="text-2xl">{icon}</span>
                      <p className="text-xs font-medium text-secondary-700 dark:text-secondary-300 mt-2">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Data Backup</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Manual Backup', desc: 'Download a full backup of all data', action: 'Download Backup', color: 'primary' },
                  { title: 'Auto Backup', desc: 'Schedule automatic daily backups', action: 'Configure', color: 'accent' },
                ].map(({ title, desc, action, color }) => (
                  <div key={title} className="bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl p-5">
                    <Database className={`w-8 h-8 mb-3 ${color === 'primary' ? 'text-primary-600' : 'text-accent-600'}`} />
                    <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{desc}</p>
                    <button onClick={() => addToast(`${action} initiated (demo)`, 'info')}
                      className="px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                      {action}
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl p-5">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-3">Backup History</h3>
                <div className="space-y-2">
                  {[
                    { date: 'Jun 16, 2024 - 11:30 PM', size: '4.2 MB', status: 'Success' },
                    { date: 'Jun 15, 2024 - 11:30 PM', size: '4.1 MB', status: 'Success' },
                    { date: 'Jun 14, 2024 - 11:30 PM', size: '3.9 MB', status: 'Success' },
                  ].map(({ date, size, status }) => (
                    <div key={date} className="flex items-center justify-between bg-white dark:bg-secondary-800 rounded-xl px-4 py-2.5 border border-secondary-100 dark:border-secondary-700">
                      <div>
                        <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200">{date}</p>
                        <p className="text-xs text-secondary-500">{size}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                        <Check className="w-3 h-3" /> {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1.5 uppercase tracking-wide">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pr-10 px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm text-secondary-800 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
                    <button onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {['New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-secondary-600 dark:text-secondary-400 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
                  </div>
                ))}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Two-Factor Authentication</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Enable 2FA for additional account security</p>
                  <button onClick={() => addToast('2FA setup initiated (demo)', 'info')} className="mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 pt-5 border-t border-secondary-100 dark:border-secondary-700 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
