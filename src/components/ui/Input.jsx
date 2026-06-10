import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  id,
  className = '',
  required = false,
  icon,
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-neutral-700 flex items-center gap-1 select-none"
        >
          {label}
          {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          required={required}
          className={`
            w-full h-9 px-3.5 py-0 text-sm bg-white border rounded-lg transition-colors duration-150 outline-hidden
            placeholder:text-neutral-400
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${icon ? 'ps-10' : ''}
            ${error
              ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/15'
              : 'border-neutral-300 hover:border-neutral-400 text-neutral-800'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger-600 font-medium">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-neutral-400">{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
