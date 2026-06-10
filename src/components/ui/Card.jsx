import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  hoverable = false,
  onClick,
  ...props
}) => {
  const Component = hoverable || onClick ? motion.div : 'div';
  const motionProps = hoverable || onClick
    ? {
        whileHover: hoverable ? { y: -2, boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' } : {},
        whileTap: onClick ? { scale: 0.99 } : {},
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-5 py-4 border-b border-neutral-150 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-neutral-800 tracking-tight leading-none select-none">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-1 select-none">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </Component>
  );
};

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3.5 bg-neutral-50 border-t border-neutral-150 flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
