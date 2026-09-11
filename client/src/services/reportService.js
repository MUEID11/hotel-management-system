import { apiGet, apiPost, apiPut } from './apiClient.js';

export function fetchDashboardSummary() {
  return apiGet('/reports/dashboard-summary');
}

export function fetchDailyReservations(date) {
  return apiGet('/reports/daily-reservations', { date });
}

export const fetchDailyRoster = fetchDailyReservations;

export function fetchMonthlyRevenue(year, month) {
  return apiGet('/reports/monthly-revenue', { year, month });
}

export function fetchOccupancyReport(startDate, endDate) {
  return apiGet('/reports/occupancy', { startDate, endDate });
}

export function fetchStaffList(params = {}) {
  return apiGet('/staff', params);
}

export function createStaffAccount(staffData) {
  return apiPost('/staff', staffData);
}

export function deactivateStaffAccount(userId) {
  return apiPut(`/staff/${userId}/deactivate`);
}