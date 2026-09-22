// UI-only constants. All records now come from the API (see src/api/client.js).

export const statusColumns = [
  { id: 'Received', label: 'Received', color: 'bg-slate-100 border-slate-200', headerColor: 'bg-slate-500', textColor: 'text-slate-700', dotColor: 'bg-slate-400' },
  { id: 'Diagnosing', label: 'Diagnosing', color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-500', textColor: 'text-blue-700', dotColor: 'bg-blue-400' },
  { id: 'Waiting Parts', label: 'Waiting Parts', color: 'bg-amber-50 border-amber-200', headerColor: 'bg-amber-500', textColor: 'text-amber-700', dotColor: 'bg-amber-400' },
  { id: 'Repairing', label: 'Repairing', color: 'bg-purple-50 border-purple-200', headerColor: 'bg-purple-500', textColor: 'text-purple-700', dotColor: 'bg-purple-400' },
  { id: 'Quality Check', label: 'Quality Check', color: 'bg-indigo-50 border-indigo-200', headerColor: 'bg-indigo-500', textColor: 'text-indigo-700', dotColor: 'bg-indigo-400' },
  { id: 'Ready', label: 'Ready', color: 'bg-teal-50 border-teal-200', headerColor: 'bg-teal-500', textColor: 'text-teal-700', dotColor: 'bg-teal-400' },
  { id: 'Delivered', label: 'Delivered', color: 'bg-green-50 border-green-200', headerColor: 'bg-green-500', textColor: 'text-green-700', dotColor: 'bg-green-400' },
];

export const priorities = ['Critical', 'High', 'Medium', 'Low'];

export const deviceCategories = ['All', 'Mobile Phone', 'Laptop', 'Desktop Computer', 'Printer', 'Tablet', 'Smart Watch', 'Accessories'];

export const deviceBrands = ['All', 'Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'Asus', 'Canon', 'OnePlus', 'Fitbit'];

export const categories = ['All', 'Screens', 'Batteries', 'Motherboards', 'Graphics Cards', 'Storage', 'Cameras', 'Connectors', 'Printer Parts', 'Cooling', 'Chassis Parts', 'Input Devices', 'Accessories', 'Consumables'];
