import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-canvas)]/80 backdrop-blur-xs">
      <div
        className={`w-full ${maxWidth} bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--surface-elevated)]">
          <div>
            <h2 className="text-base font-heading font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--surface-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
