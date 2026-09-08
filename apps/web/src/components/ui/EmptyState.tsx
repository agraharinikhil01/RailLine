import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50',
          className
        )
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3.5">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
