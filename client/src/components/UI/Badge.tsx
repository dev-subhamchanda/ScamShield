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
  let colorClasses = 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-color)]';

  if (variant === 'severity' && severity) {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        colorClasses = 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]';
        break;
      case 'LOW':
        colorClasses = 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]';
        break;
      case 'SAFE':
        colorClasses = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]';
        break;
    }
  } else if (variant === 'accent') {
    colorClasses = 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border-[var(--border-color)]';
  } else if (variant === 'success') {
    colorClasses = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]';
  } else if (variant === 'warning') {
    colorClasses = 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]';
  } else if (variant === 'danger') {
    colorClasses = 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border tracking-wider uppercase font-mono ${colorClasses} ${className}`}
    >
      {label || children || severity}
    </span>
  );
};
