import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  options = [],
  placeholder = 'Select an option',
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-neutral-700 flex items-center gap-1 select-none"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        required={required}
        className={`
          w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-all duration-150 outline-hidden
          focus:border-primary-600 focus:ring-1 focus:ring-primary-600
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/10' 
            : 'border-neutral-300 hover:border-neutral-400 text-neutral-800'
          }
          disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-600 mt-0.5 font-medium">{error}</span>
      )}
      {!error && helperText && (
        <span className="text-xs text-neutral-500 mt-0.5">{helperText}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
