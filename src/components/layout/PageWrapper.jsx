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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`space-y-5 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none no-print">
          <div>
            {title && (
              <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full space-y-5">{children}</div>
    </motion.div>
  );
};

export default PageWrapper;
