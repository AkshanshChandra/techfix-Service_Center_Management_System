export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getStatusBadge = (status) => {
  const map = {
    'Received':      'bg-slate-100 text-slate-700 border border-slate-200',
    'Diagnosing':    'bg-blue-100 text-blue-700 border border-blue-200',
    'Waiting Parts': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Repairing':     'bg-purple-100 text-purple-700 border border-purple-200',
    'Quality Check': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    'Ready':         'bg-teal-100 text-teal-700 border border-teal-200',
    'Delivered':     'bg-green-100 text-green-700 border border-green-200',
    'Active':        'bg-green-100 text-green-700 border border-green-200',
    'Inactive':      'bg-gray-100 text-gray-600 border border-gray-200',
    'VIP':           'bg-amber-100 text-amber-700 border border-amber-200',
    'Available':     'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Busy':          'bg-red-100 text-red-700 border border-red-200',
    'On Leave':      'bg-gray-100 text-gray-600 border border-gray-200',
    'Paid':          'bg-green-100 text-green-700 border border-green-200',
    'Pending':       'bg-amber-100 text-amber-700 border border-amber-200',
    'Overdue':       'bg-red-100 text-red-700 border border-red-200',
    'Low Stock':     'bg-amber-100 text-amber-700 border border-amber-200',
    'Out of Stock':  'bg-red-100 text-red-700 border border-red-200',
    'Critical':      'bg-red-100 text-red-700 border border-red-200',
    'High':          'bg-orange-100 text-orange-700 border border-orange-200',
    'Medium':        'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Low':           'bg-blue-100 text-blue-700 border border-blue-200',
  };
  return map[status] || 'bg-gray-100 text-gray-600 border border-gray-200';
};

export const getPriorityDot = (priority) => {
  const map = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500' };
  return map[priority] || 'bg-gray-400';
};
