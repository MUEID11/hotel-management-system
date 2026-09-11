import {
  getDailyReservationsReportService,
  getDashboardSummaryService,
  getMonthlyRevenueReportService,
  getOccupancyReportService,
} from '../services/reportService.js';
import { AppError } from '../utils/errors.js';
import { errorResponse, successResponse } from '../utils/responseFormatter.js';
import {
  isValidDateString,
  sanitizeString,
} from '../utils/validators.js';

export async function getDashboardSummary(request, response, next) {
  try {
    const summary = await getDashboardSummaryService();

    if (!summary) {
      throw new AppError('Unable to load dashboard summary.', 500);
    }

    return response.json(
      successResponse('Dashboard summary retrieved.', summary)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getDailyReservationsReport(request, response, next) {
  try {
    const reportDate = sanitizeString(request.query.date);

    if (!isValidDateString(reportDate)) {
      return response.status(422).json(
        errorResponse('A valid report date (YYYY-MM-DD) is required.')
      );
    }

    const rows = await getDailyReservationsReportService(reportDate);

    return response.json(
      successResponse('Daily reservations report retrieved.', rows)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getMonthlyRevenueReport(request, response, next) {
  try {
    const year = Number(request.query.year);
    const month = Number(request.query.month);

    if (!year || !month || month < 1 || month > 12) {
      return response.status(422).json(
        errorResponse('A valid year and month (1-12) are required.')
      );
    }

    const report = await getMonthlyRevenueReportService(year, month);

    return response.json(
      successResponse('Monthly revenue report retrieved.', report)
    );
  } catch (error) {
    return next(error);
  }
}

export async function getOccupancyReport(request, response, next) {
  try {
    const startDate = sanitizeString(request.query.startDate);
    const endDate = sanitizeString(request.query.endDate);

    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      return response.status(422).json(
        errorResponse('Valid start and end dates are required.')
      );
    }

    const report = await getOccupancyReportService(startDate, endDate);

    return response.json(
      successResponse('Occupancy report retrieved.', report)
    );
  } catch (error) {
    return next(error);
  }
}