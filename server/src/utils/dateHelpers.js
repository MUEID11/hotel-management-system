/**
 * Small date helpers used at the API boundary for validation.
 * The authoritative date rules (past check-in, ordering, overlap prevention)
 * live inside the stored procedures, so these checks are a defensive convenience.
 */

export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

export function isCheckInInPast(checkInDate) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const checkIn = new Date(`${checkInDate}T00:00:00Z`);
  return checkIn < today;
}

export function isCheckOutAfterCheckIn(checkInDate, checkOutDate) {
  const checkIn = new Date(`${checkInDate}T00:00:00Z`);
  const checkOut = new Date(`${checkOutDate}T00:00:00Z`);
  return checkOut > checkIn;
}

export function validateDateRange(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    throw new Error('Both check-in date and check-out date are required.');
  }

  if (!isValidDateString(checkInDate) || !isValidDateString(checkOutDate)) {
    throw new Error('Invalid date format. Dates must be in YYYY-MM-DD format.');
  }

  if (!isCheckOutAfterCheckIn(checkInDate, checkOutDate)) {
    throw new Error('Check-out date must be chronologically after check-in date.');
  }

  return {
    checkInFormatted: checkInDate,
    checkOutFormatted: checkOutDate
  };
}

export function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(`${checkInDate}T00:00:00Z`);
  const checkOut = new Date(`${checkOutDate}T00:00:00Z`);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}