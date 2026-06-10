import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 select-none shrink-0';

  const variants = {
    primary:
      'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus-visible:ring-primary-500 shadow-sm',
    secondary:
      'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-200 text-neutral-700 focus-visible:ring-neutral-400',
    outline:
      'bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 border border-neutral-300 focus-visible:ring-primary-500',
    ghost:
      'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-600 focus-visible:ring-primary-500',
    danger:
      'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white focus-visible:ring-danger-500 shadow-sm',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-xs gap-1.5 h-7',
    md:  'px-3.5 py-2 text-sm gap-2 h-9',
    lg:  'px-5 py-2.5 text-sm gap-2 h-10',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex items-center justify-center shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex items-center justify-center shrink-0">{icon}</span>
      )}
    </button>
  );
};

export default Button;
