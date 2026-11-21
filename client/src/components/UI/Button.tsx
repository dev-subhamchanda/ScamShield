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
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6366F1] focus:ring-offset-[#090B10] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  let sizeClasses = 'text-sm px-4 py-2 rounded-lg gap-2';
  if (size === 'sm') sizeClasses = 'text-xs px-3 py-1.5 rounded-md gap-1.5';
  if (size === 'lg') sizeClasses = 'text-base px-6 py-3 rounded-xl gap-2.5';

  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-[#6366F1] hover:bg-[#4F46E5] text-[#F1F5F9] shadow-sm shadow-[#6366F1]/20 active:translate-y-px';
      break;
    case 'secondary':
      variantClasses =
        'bg-[#11151E] hover:bg-[#1B2230] text-[#F1F5F9] border border-[#30394B] active:translate-y-px';
      break;
    case 'danger':
      variantClasses =
        'bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 active:translate-y-px';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-[#1B2230] text-[#94A3B8] hover:text-[#F1F5F9]';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
