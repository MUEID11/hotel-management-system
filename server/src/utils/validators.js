// Lightweight, dependency-free field validators used at the API boundary.
// All rules here are defense-in-depth; the stored procedures enforce the same
// business rules authoritatively.

export function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isPresent(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return false;
  }
  const trimmed = value.trim();
  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidPhone(value) {
  // Accepts digits, spaces, dashes, plus and parentheses, 7-20 characters.
  return /^[0-9+\-() ]{7,20}$/.test(value.trim());
}

export function isValidPositiveNumber(value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value > 0;
}

export function isValidNonNegativeNumber(value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0;
}

export function isIntegerBetween(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}