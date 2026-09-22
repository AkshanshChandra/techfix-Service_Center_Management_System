import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Briefcase, CheckCircle, Zap, Mail, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useOutletContext } from 'react-router-dom';

const SPECIALIZATIONS = ['Mobile Phones', 'Laptops', 'Desktop Computers', 'Printers', 'Tablets', 'Smart Watches', 'Accessories'];
const SHIFTS = ['Morning (9AM - 6PM)', 'Evening (12PM - 9PM)'];

const emptyForm = {
  name: '', email: '', phone: '', specialization: [], experience: '',
  shift: SHIFTS[0], skills: '', certifications: '',
};

export default function Technicians() {
  const { addToast } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => api.technicians.list(), []);
  const technicians = data || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleSpecialization = (s) => setForm((f) => ({
    ...f,
    specialization: f.specialization.includes(s)
      ? f.specialization.filter((x) => x !== s)
      : [...f.specialization, s],
  }));

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone) {
      addToast('Name, email and phone are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.technicians.create({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean),
        joinDate: new Date().toISOString().slice(0, 10),
      });
      setShowAdd(false);
      setForm(emptyForm);
      reload();
      addToast('Technician added successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Technicians</h1>
          <p className="text-sm text-secondary-500 mt-0.5">{technicians.length} service technicians</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          + Add Technician
        </button>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Technicians', value: technicians.length, icon: Briefcase, color: 'text-primary-600 bg-primary-50' },
          { label: 'Available Now', value: technicians.filter(t => t.availability === 'Available').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Efficiency', value: `${Math.round(technicians.reduce((s, t) => s + t.efficiency, 0) / technicians.length)}%`, icon: Zap, color: 'text-amber-600 bg-amber-50' },
          { label: 'Jobs Completed', value: technicians.reduce((s, t) => s + t.completedJobs, 0).toLocaleString(), icon: Star, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Technician cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {technicians.map((tech, i) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-secondary-100 dark:border-secondary-700 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${tech.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold`}>
                  {tech.avatar}
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 dark:text-white">{tech.name}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">{tech.experience} experience</p>
                </div>
              </div>
              <StatusBadge status={tech.availability} size="xs" />
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tech.specialization.map(s => (
                <span key={s} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full font-medium">{s}</span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Current', value: tech.currentJobs, color: 'text-blue-600' },
                { label: 'Completed', value: tech.completedJobs.toLocaleString(), color: 'text-green-600' },
                { label: 'Efficiency', value: `${tech.efficiency}%`, color: 'text-purple-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center bg-secondary-50 dark:bg-secondary-700/50 rounded-xl py-2.5">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-secondary-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Efficiency bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-secondary-500 dark:text-secondary-400">Efficiency</span>
                <span className="font-semibold text-secondary-700 dark:text-secondary-300">{tech.efficiency}%</span>
              </div>
              <div className="h-2 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tech.efficiency}%` }}
                  transition={{ delay: i * 0.1 + 0.4, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${tech.efficiency >= 95 ? 'bg-green-500' : tech.efficiency >= 90 ? 'bg-primary-500' : 'bg-amber-500'}`}
                />
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, j) => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(tech.rating) ? 'fill-amber-400 text-amber-400' : 'text-secondary-200 dark:text-secondary-600'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-secondary-900 dark:text-white">{tech.rating}</span>
            </div>

            {/* Contact */}
            <div className="space-y-1.5 pt-4 border-t border-secondary-100 dark:border-secondary-700">
              <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <Mail className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                <span className="truncate">{tech.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <Clock className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
                <span>{tech.shift}</span>
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-3 flex flex-wrap gap-1">
              {tech.certifications.map(cert => (
                <span key={cert} className="text-xs bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400 px-2 py-0.5 rounded-full">{cert}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Technician Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Technician" size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Full Name</label>
              <input value={form.name} onChange={setField('name')} placeholder="Rahul Sharma" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Experience</label>
              <input value={form.experience} onChange={setField('experience')} placeholder="3 years" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={setField('email')} placeholder="rahul.sharma@techfix.in" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={setField('phone')} placeholder="+91 98765 43210" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Specialization</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSpecialization(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.specialization.includes(s) ? 'bg-primary-600 text-white' : 'bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Shift</label>
            <select value={form.shift} onChange={setField('shift')} className={inputClass}>
              {SHIFTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Skills (comma separated)</label>
            <input value={form.skills} onChange={setField('skills')} placeholder="iOS Repair, Micro-soldering, Data Recovery" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Certifications (comma separated)</label>
            <input value={form.certifications} onChange={setField('certifications')} placeholder="Apple Certified Technician" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving ? 'Adding...' : 'Add Technician'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
