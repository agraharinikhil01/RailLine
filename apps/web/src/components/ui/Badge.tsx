import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'ontime' | 'delayed' | 'critical' | 'neutral' | 'accent';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    ontime: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delayed: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const dotColors = {
    ontime: 'bg-emerald-500',
    delayed: 'bg-amber-500',
    critical: 'bg-rose-500',
    neutral: 'bg-slate-400',
    accent: 'bg-sky-500',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
