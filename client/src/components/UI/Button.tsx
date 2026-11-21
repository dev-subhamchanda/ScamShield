import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-canvas)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  let sizeClasses = 'text-xs px-3.5 py-2 rounded-lg gap-2';
  if (size === 'sm') sizeClasses = 'text-xs px-2.5 py-1.5 rounded-md gap-1.5';
  if (size === 'lg') sizeClasses = 'text-sm px-5 py-2.5 rounded-xl gap-2.5';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-semibold shadow-xs active:translate-y-px';
      break;
    case 'secondary':
      variantClasses =
        'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-color)] active:translate-y-px';
      break;
    case 'danger':
      variantClasses =
        'bg-[var(--status-danger-bg)] hover:opacity-90 text-[var(--status-danger)] border border-[var(--status-danger)] active:translate-y-px';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
