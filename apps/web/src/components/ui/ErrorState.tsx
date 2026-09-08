import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to fetch train information. Please check your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-100 bg-rose-50/50',
          className
        )
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3.5">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-700/80 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="border-rose-200 text-rose-900 hover:bg-rose-100/50">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};
