import { classNames } from '../../utils/format.js';

// Unified form field supporting input, select, and textarea rendering.
export default function Field({
  label,
  name,
  type = 'text',
  as = 'input',
  error,
  required,
  hint,
  className = '',
  options = [],
  placeholder = '',
  children,
  disabled,
  ...rest
}) {
  const inputClasses = classNames(
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400',
    error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    disabled && 'cursor-not-allowed bg-slate-100 text-slate-500',
    className
  );

  let control;
  if (as === 'select') {
    control = (
      <select id={name} name={name} className={inputClasses} disabled={disabled} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const value = typeof option === 'object' ? option.value : option;
          const text = typeof option === 'object' ? option.label : option;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
        {children}
      </select>
    );
  } else if (as === 'textarea') {
    control = (
      <textarea
        id={name}
        name={name}
        rows={rest.rows ?? 3}
        className={classNames(inputClasses, 'resize-none')}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
    );
  } else {
    control = (
      <input
        id={name}
        name={name}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}