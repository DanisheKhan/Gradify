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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`space-y-5 ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 select-none no-print pb-1">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 mt-0.5">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="w-full space-y-4">{children}</div>
    </motion.div>
  );
};

export default PageWrapper;
