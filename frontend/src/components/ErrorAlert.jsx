/**
 * ErrorAlert Component (Task 157)
 * Styled alert component for displaying error messages
 */
import { AlertCircle, X } from 'lucide-react';

function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-slide-down">
      <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;