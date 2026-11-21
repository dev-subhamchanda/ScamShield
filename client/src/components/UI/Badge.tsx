import React from 'react';
import type { RiskSeverity } from '../../types';

interface BadgeProps {
  severity?: RiskSeverity;
  label?: string;
  variant?: 'severity' | 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  severity,
  label,
  variant = 'severity',
  children,
  className = '',
}) => {
  let colorClasses = 'bg-[#1B2230] text-[#94A3B8] border-[#30394B]';

  if (variant === 'severity' && severity) {
    switch (severity) {
      case 'CRITICAL':
        colorClasses = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40';
        break;
      case 'HIGH':
        colorClasses = 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/40';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40';
        break;
      case 'LOW':
        colorClasses = 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40';
        break;
      case 'SAFE':
        colorClasses = 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40';
        break;
    }
  } else if (variant === 'accent') {
    colorClasses = 'bg-[#6366F1]/15 text-[#818CF8] border-[#818CF8]/30';
  } else if (variant === 'success') {
    colorClasses = 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40';
  } else if (variant === 'warning') {
    colorClasses = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40';
  } else if (variant === 'danger') {
    colorClasses = 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase font-mono ${colorClasses} ${className}`}
    >
      {label || children || severity}
    </span>
  );
};
