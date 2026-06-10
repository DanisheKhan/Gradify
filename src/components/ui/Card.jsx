import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  hoverable = false,
  onClick,
  noPadding = false,
  ...props
}) => {
  const Tag = onClick || hoverable ? 'button' : 'div';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        bg-white border border-neutral-200 rounded-xl overflow-hidden
        ${onClick ? 'cursor-pointer transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500' : ''}
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-md' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-neutral-800 tracking-tight leading-none select-none">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-1 select-none">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
