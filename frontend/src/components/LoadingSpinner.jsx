/**
 * LoadingSpinner Component (Task 156)
 * Animated loading spinner with optional text
 */
import { Loader2 } from 'lucide-react';

function LoadingSpinner({ text = 'Loading...', size = 'default' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={`${sizeClasses[size]} text-primary-600 dark:text-primary-400 animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;