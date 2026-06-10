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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 active:scale-98 select-none';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm border border-transparent',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400 border border-transparent',
    outline: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 focus:ring-primary-500 shadow-xs',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-primary-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none active:scale-100';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${(disabled || loading) ? disabledStyles : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex items-center justify-center">{icon}</span>
      )}
    </button>
  );
};
export default Button;
