import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/50',
    info: 'bg-blue-50 text-blue-700 border-blue-200/50',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-250',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border tracking-wide select-none
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
