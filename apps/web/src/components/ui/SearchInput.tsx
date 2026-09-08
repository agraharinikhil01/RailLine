import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, isLoading, placeholder = 'Search train number or name...', ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={twMerge(
            clsx(
              'w-full pl-10 pr-10 py-2.5 bg-white text-slate-900 placeholder:text-slate-400',
              'border border-slate-200 rounded-xl shadow-subtle text-sm',
              'transition-all duration-150',
              'focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10',
              className
            )
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
