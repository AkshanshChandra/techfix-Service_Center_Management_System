import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Clock, User, AlertCircle, Loader2 } from 'lucide-react';
import { statusColumns, priorities } from '../data/constants';
import { formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import Modal from '../components/Modal';

const emptyForm = {
  customerId: '', deviceId: '', technicianId: '', issue: '',
  priority: 'Medium', cost: '', estimatedDelivery: '',
};

export default function RepairJobs() {
  const navigate = useNavigate();
  const { addToast } = useOutletContext();
  const { data: jobs, loading, error, reload, setData } = useApi(() => api.repairJobs.list(), []);
  const { data: customers } = useApi(() => api.customers.list(), []);
  const { data: technicians } = useApi(() => api.technicians.list(), []);
  const { data: devices } = useApi(() => api.devices.list(), []);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectCustomer = (e) => setForm((f) => ({ ...f, customerId: e.target.value, deviceId: '' }));

  const customerDevices = (devices || []).filter((d) => d.customerId === form.customerId);

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggedId;
    setDraggedId(null);
    if (!id) return;

    const job = jobs.find((j) => j.id === id);
    if (!job || job.status === targetStatus) return;

    setData((prev) => prev.map((j) => (j.id === id ? { ...j, status: targetStatus } : j)));
    try {
      const updated = await api.repairJobs.setStatus(id, targetStatus);
      setData((prev) => prev.map((j) => (j.id === id ? updated : j)));
      addToast(`${id} moved to "${targetStatus}"`, 'success');
    } catch (err) {
      setData((prev) => prev.map((j) => (j.id === id ? job : j)));
      addToast(err.message, 'error');
    }
  };

  const handleCreate = async () => {
    const device = customerDevices.find((d) => d.id === form.deviceId);
    if (!form.customerId || !device || !form.issue) {
      addToast('Customer, device and problem description are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.repairJobs.create({
        customerId: form.customerId,
        technicianId: form.technicianId || null,
        issue: form.issue,
        priority: form.priority,
        cost: Number(form.cost) || 0,
        estimatedDelivery: form.estimatedDelivery,
        device: device.name,
        category: device.category,
        brand: device.brand,
        model: device.model,
        serial: device.serial,
      });
      setShowAdd(false);
      setForm(emptyForm);
      reload();
      addToast('New repair job created', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const priorityDot = (p) => ({
    Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500'
  }[p] || 'bg-gray-400');

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-sm text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-secondary-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-5 text-sm text-red-700">
          Could not load repair jobs: {error}
          <button onClick={reload} className="ml-3 underline font-medium">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Repair Jobs</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Drag cards between columns to update status</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </motion.div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '75vh' }}>
        {statusColumns.map(col => {
          const colJobs = jobs.filter(j => j.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border-2 transition-all duration-200 ${
                dragOverCol === col.id ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10' : 'border-transparent bg-secondary-100/80 dark:bg-secondary-800/50'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.textColor} ${col.color} border`}>
                  {colJobs.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                <AnimatePresence>
                  {colJobs.map((job, i) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.04 }}
                      draggable
                      onDragStart={e => { setDraggedId(job.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={() => navigate(`/repair-jobs/${job.id}`)}
                      className={`bg-white dark:bg-secondary-800 rounded-xl p-3.5 shadow-sm border border-secondary-100 dark:border-secondary-700 cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-md group ${draggedId === job.id ? 'opacity-40 rotate-1 scale-95' : 'hover:-translate-y-0.5'}`}
                    >
                      {/* Job header */}
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">{job.id}</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${priorityDot(job.priority)}`} />
                          <span className="text-xs text-secondary-500 dark:text-secondary-400">{job.priority}</span>
                        </div>
                      </div>

                      {/* Device */}
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white leading-tight truncate">{job.device}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5 line-clamp-2">{job.issue}</p>

                      {/* Customer */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <User className="w-3 h-3 text-secondary-400 flex-shrink-0" />
                        <span className="text-xs text-secondary-600 dark:text-secondary-400 truncate">{job.customerName}</span>
                      </div>

                      {/* Technician */}
                      {job.technicianName && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-primary-600">{job.technicianName.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{job.technicianName}</span>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-secondary-400">Progress</span>
                          <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">{job.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className={`h-full rounded-full ${job.progress === 100 ? 'bg-green-500' : job.progress > 60 ? 'bg-primary-500' : job.progress > 30 ? 'bg-amber-500' : 'bg-secondary-400'}`}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-secondary-100 dark:border-secondary-700">
                        <div className="flex items-center gap-1 text-xs text-secondary-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(job.estimatedDelivery)}
                        </div>
                        <span className="text-xs font-semibold text-secondary-900 dark:text-white">₹{job.cost.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {colJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-secondary-300 dark:text-secondary-600">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">No jobs here</p>
                  </div>
                )}

                {/* Drop zone indicator */}
                {dragOverCol === col.id && (
                  <div className="border-2 border-dashed border-primary-300 rounded-xl p-4 text-center">
                    <p className="text-xs text-primary-500 font-medium">Drop here to move</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Repair Job" size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Customer</label>
              <select value={form.customerId} onChange={selectCustomer} className={inputClass}>
                <option value="">Select a customer</option>
                {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Assign Technician</label>
              <select value={form.technicianId} onChange={setField('technicianId')} className={inputClass}>
                <option value="">Unassigned</option>
                {(technicians || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Device</label>
            <select
              value={form.deviceId}
              onChange={setField('deviceId')}
              disabled={!form.customerId}
              className={`${inputClass} disabled:opacity-60`}
            >
              <option value="">
                {!form.customerId ? 'Select a customer first' : customerDevices.length === 0 ? 'No devices registered for this customer' : 'Select a device'}
              </option>
              {customerDevices.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.serial}</option>
              ))}
            </select>
            {form.customerId && customerDevices.length === 0 && (
              <p className="text-xs text-secondary-400 mt-1.5">
                This customer has no registered devices. Register one on the Devices page first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Problem Description</label>
            <input value={form.issue} onChange={setField('issue')} placeholder="Describe the issue the customer reported..." className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={setField('priority')} className={inputClass}>
                {priorities.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Estimated Cost</label>
              <input type="number" value={form.cost} onChange={setField('cost')} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Est. Delivery</label>
              <input type="date" value={form.estimatedDelivery} onChange={setField('estimatedDelivery')} className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium rounded-xl hover:bg-secondary-50 transition-colors">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={saving || !form.deviceId}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
