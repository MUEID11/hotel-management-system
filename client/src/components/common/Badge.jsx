import { classNames } from '../../utils/format.js';

const STATUS_MAP = {
  ADMIN: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  RECEPTIONIST: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  GUEST: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  AVAILABLE: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  OCCUPIED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  MAINTENANCE: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  CONFIRMED: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  CHECKED_IN: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  CHECKED_OUT: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

export default function Badge({
  children,
  status,
  color,
  size = 'md',
  showDot = false,
  className = '',
}) {
  const resolvedColor =
    color ||
    (status && STATUS_MAP[String(status).toUpperCase()]) ||
    'bg-slate-100 text-slate-700 ring-slate-500/20';

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  const content = children ?? status ?? '';

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        sizeClasses,
        resolvedColor,
        className
      )}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {content}
    </span>
  );
}