import { Loader2, AlertTriangle } from 'lucide-react';

/** Renders a spinner or an error with a retry button; `null` once data is ready. */
export default function AsyncState({ loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-secondary-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
        <p className="font-medium text-secondary-800 dark:text-white">Could not reach the server</p>
        <p className="text-sm text-secondary-500 mt-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}
