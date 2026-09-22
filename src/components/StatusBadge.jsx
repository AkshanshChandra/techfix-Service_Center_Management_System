import { getStatusBadge } from '../utils/helpers';

export default function StatusBadge({ status, size = 'sm' }) {
  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${getStatusBadge(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
