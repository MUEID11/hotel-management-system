import { classNames } from '../../utils/format.js';

export default function Card({ children, className = '', padded = true, ...props }) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        padded && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}