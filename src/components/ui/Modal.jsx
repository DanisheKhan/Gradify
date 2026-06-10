import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className={`
              relative w-full bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-neutral-200 flex flex-col
              ${sizeClasses[size]}
            `}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              {title && (
                <h3 className="text-sm font-semibold text-neutral-900 tracking-tight select-none">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 overflow-y-auto max-h-[calc(100vh-14rem)] text-sm text-neutral-700">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
