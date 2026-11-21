import React from 'react';
import { FontAwesomeIcon, faCircleXmark } from './Icons';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full ${maxWidth} bg-[#11151E] border border-[#30394B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="px-6 py-4 border-b border-[#30394B] flex items-center justify-between bg-[#1B2230]/40">
          <div>
            <h3 className="text-lg font-semibold text-[#F1F5F9]">{title}</h3>
            {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-[#1B2230] transition-colors"
          >
            <FontAwesomeIcon icon={faCircleXmark} className="text-lg" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
