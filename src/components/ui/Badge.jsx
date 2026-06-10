import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variants = {
    success: 'bg-success-50 text-success-700 ring-1 ring-success-100',
    warning: 'bg-warning-50 text-warning-600 ring-1 ring-warning-100',
    danger:  'bg-danger-50 text-danger-600 ring-1 ring-danger-100',
    info:    'bg-primary-50 text-primary-700 ring-1 ring-primary-100',
    neutral: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-150',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md tracking-wide select-none
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
