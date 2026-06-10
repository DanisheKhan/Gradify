import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
          className="text-xs font-semibold text-neutral-600 flex items-center gap-1 select-none tracking-wide uppercase"
        >
          {label}
          {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={required}
          className={`
            w-full h-10 pl-3.5 pr-9 py-0 text-sm bg-white border-2 rounded-xl transition-all duration-150 outline-none appearance-none cursor-pointer font-medium
            focus:border-primary-400 focus:ring-3 focus:ring-primary-400/15
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${error
              ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/15 text-danger-700'
              : 'border-neutral-200 hover:border-neutral-300 text-neutral-800'
            }
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
        {/* Custom chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
          <ChevronDown className="w-4 h-4" />
        </span>
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

Select.displayName = 'Select';
export default Select;
