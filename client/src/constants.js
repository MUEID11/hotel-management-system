// Shared domain constants: statuses, roles, payment methods and their
// presentation metadata used across the UI (badges, selects, filters).
export const RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
];

export const RESERVATION_STATUS_META = {
  PENDING: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800 ring-amber-600/20' },
  CONFIRMED: { label: 'Approved & Confirmed', color: 'bg-sky-100 text-sky-800 ring-sky-600/20' },
  CHECKED_IN: { label: 'Checked In', color: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20' },
  CHECKED_OUT: { label: 'Checked Out', color: 'bg-slate-100 text-slate-700 ring-slate-500/20' },
  CANCELLED: { label: 'Cancelled / Declined', color: 'bg-rose-100 text-rose-800 ring-rose-600/20' },
};

export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'];

export const ROOM_STATUS_META = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' },
  OCCUPIED: { label: 'Occupied', color: 'bg-rose-100 text-rose-700 ring-rose-600/20' },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700 ring-amber-600/20' },
  INACTIVE: { label: 'Inactive', color: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
};

export const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_TRANSFER', 'BANK_TRANSFER'];

export const PAYMENT_METHOD_LABELS = {
  CASH: 'Cash',
  CARD: 'Card',
  MOBILE_TRANSFER: 'Mobile Transfer',
  BANK_TRANSFER: 'Bank Transfer',
};

export const ROLES = ['GUEST', 'RECEPTIONIST', 'ADMIN'];

export const ROLE_LABELS = {
  GUEST: 'Guest',
  RECEPTIONIST: 'Front Desk',
  ADMIN: 'Administrator',
};