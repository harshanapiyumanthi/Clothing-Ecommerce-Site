import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-transparent border rounded text-sm outline-none transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-color)] focus:border-gold'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error.message}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
