import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Printer, FileText, RefreshCw, Phone, Mail, MapPin,
  Cpu, AlertTriangle, CheckCircle, Clock, DollarSign, Package, Shield
} from 'lucide-react';
import { statusColumns } from '../data/constants';
import StatusBadge from '../components/StatusBadge';
import AsyncState from '../components/AsyncState';
import { formatCurrency, formatDate } from '../utils/helpers';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const timelineSteps = [
  { status: 'Received', label: 'Device Received', desc: 'Customer dropped off device' },
  { status: 'Diagnosing', label: 'Diagnosis', desc: 'Technician assessing issue' },
  { status: 'Waiting Parts', label: 'Parts Ordered', desc: 'Required parts procured' },
  { status: 'Repairing', label: 'In Repair', desc: 'Active repair in progress' },
  { status: 'Quality Check', label: 'Quality Check', desc: 'Testing & verification' },
  { status: 'Ready', label: 'Ready', desc: 'Device ready for pickup' },
  { status: 'Delivered', label: 'Delivered', desc: 'Returned to customer' },
];

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useOutletContext();

  const { data: job, loading, error, setData } = useApi(() => api.repairJobs.get(id), [id]);

  const changeStatus = async (status) => {
    try {
      setData(await api.repairJobs.setStatus(id, status));
      addToast(`Status updated to "${status}"`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const generateInvoice = async () => {
    try {
      const invoice = await api.invoices.create({
        jobId: job.id,
        customerId: job.customerId,
        amount: job.cost,
      });
      addToast(`Invoice ${invoice.id} generated`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <AsyncState loading />;

  if (!job || error) {
    return (
      <div className="p-6 text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
        <p className="text-lg font-semibold text-secondary-900 dark:text-white">Job not found</p>
        <button onClick={() => navigate('/repair-jobs')} className="mt-4 text-primary-600 hover:underline">
          ← Back to Repair Jobs
        </button>
      </div>
    );
  }

  const currentStepIdx = timelineSteps.findIndex(s => s.status === job.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/repair-jobs')}
            className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">{job.id}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-sm text-secondary-500 mt-0.5">{job.device}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => addToast('Job card printed', 'info')} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={generateInvoice} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-sm font-medium hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
            <FileText className="w-4 h-4" /> Invoice
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold">
            <RefreshCw className="w-4 h-4" />
            <select
              value={job.status}
              onChange={e => changeStatus(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer [&>option]:text-secondary-800"
            >
              {statusColumns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-5">Repair Timeline</h3>
        <div className="flex items-center">
          {timelineSteps.map((step, i) => {
            const isCompleted = i < currentStepIdx;
            const isCurrent = i === currentStepIdx;
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30' : 'bg-secondary-200 dark:bg-secondary-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-xs font-bold text-white">{i + 1}</span>}
                  </motion.div>
                  <div className="text-center mt-2 w-16">
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-green-600' : 'text-secondary-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-green-400' : 'bg-secondary-200 dark:bg-secondary-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Device Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-primary-600" />
              <h3 className="font-semibold text-secondary-900 dark:text-white">Device Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Device Name', value: job.device },
                { label: 'Category', value: job.category },
                { label: 'Brand', value: job.brand },
                { label: 'Model', value: job.model },
                { label: 'Serial Number', value: job.serial, mono: true },
                { label: 'Priority', value: job.priority },
              ].map(({ label, value, mono }) => (
                <div key={label} className="bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-3">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-0.5">{label}</p>
                  <p className={`text-sm font-semibold text-secondary-900 dark:text-white ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Problem & Diagnosis */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-secondary-900 dark:text-white">Problem & Diagnosis</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">Reported Problem</p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3">
                  <p className="text-sm text-red-800 dark:text-red-300">{job.issue}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">Technician's Diagnosis</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">{job.diagnosis}</p>
                </div>
              </div>
              {job.notes && (
                <div>
                  <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">Repair Notes</p>
                  <div className="bg-secondary-50 dark:bg-secondary-700/50 border border-secondary-100 dark:border-secondary-700 rounded-xl p-3">
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{job.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Parts Required */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-purple-500" />
              <h3 className="font-semibold text-secondary-900 dark:text-white">Parts Required</h3>
            </div>
            {job.partsRequired.length === 0 ? (
              <p className="text-sm text-secondary-400">No parts required for this repair</p>
            ) : (
              <div className="space-y-2">
                {job.partsRequired.map((part, i) => (
                  <div key={i} className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-700/50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm text-secondary-700 dark:text-secondary-300">{part}</span>
                    </div>
                    <span className="text-xs font-medium text-secondary-500 bg-secondary-100 dark:bg-secondary-700 px-2 py-1 rounded-lg">Sourced</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {job.customerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">{job.customerName}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{job.customerId}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                <Phone className="w-3.5 h-3.5 text-primary-500" />
                <span>{job.customerPhone}</span>
              </div>
            </div>
          </motion.div>

          {/* Repair Cost */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-secondary-900 dark:text-white">Cost Breakdown</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Repair Cost', value: job.cost },
                { label: 'GST (18%)', value: Math.round(job.cost * 0.18) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
                  <span className="font-medium text-secondary-900 dark:text-white">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="border-t border-secondary-100 dark:border-secondary-700 pt-2 flex justify-between">
                <span className="font-semibold text-secondary-900 dark:text-white">Total</span>
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">{formatCurrency(Math.round(job.cost * 1.18))}</span>
              </div>
            </div>
          </motion.div>

          {/* Dates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-secondary-900 dark:text-white">Schedule</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Received', value: formatDate(job.receivedDate) },
                { label: 'Est. Delivery', value: formatDate(job.estimatedDelivery) },
                { label: 'Warranty', value: job.warranty },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">{label}</span>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Warranty */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-300">Post-Repair Warranty</h3>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{job.warranty}</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Comprehensive coverage for repaired components</p>
          </motion.div>

          {/* Technician */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-5 shadow-card border border-secondary-100 dark:border-secondary-700">
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-3">Assigned Technician</h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {job.technicianName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">{job.technicianName}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">{job.technicianId}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
