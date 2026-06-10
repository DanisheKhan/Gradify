import React from 'react';
import { motion } from 'framer-motion';

export const PageWrapper = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`space-y-6 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none no-print">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-neutral-800 sm:text-2xl tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-1 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
    </motion.div>
  );
};

export default PageWrapper;
