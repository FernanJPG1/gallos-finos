import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white shadow-lg shadow-primary-950/40 hover:brightness-110 hover:shadow-glow-red border border-primary-500/40',
    gold:
      'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-dark-bg font-bold shadow-lg shadow-gold-950/50 hover:brightness-110 hover:shadow-glow-gold border border-gold-400',
    secondary:
      'bg-dark-surface hover:bg-dark-hover text-slate-200 border border-dark-border/80 shadow-sm',
    outline:
      'border border-primary-500/60 text-primary-400 hover:bg-primary-950/50 hover:border-primary-400',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-dark-surface/60',
    danger:
      'bg-red-700 hover:bg-red-600 text-white shadow-md shadow-red-950/50',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};
