import { callProcedure } from './procedureRunner.js';

export async function getDashboardSummaryService() {
  const rows = await callProcedure('sp_get_dashboard_summary');
  return rows.length > 0 ? rows[0] : null;
}

export async function getDailyReservationsReportService(reportDate) {
  return callProcedure('sp_get_daily_reservations_report', [reportDate]);
}

export async function getMonthlyRevenueReportService(year, month) {
  const rows = await callProcedure('sp_get_monthly_revenue_report', [year, month]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getOccupancyReportService(startDate, endDate) {
  const rows = await callProcedure('sp_get_occupancy_report', [startDate, endDate]);
  return rows.length > 0 ? rows[0] : null;
}