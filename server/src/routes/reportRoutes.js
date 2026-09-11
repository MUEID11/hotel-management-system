import { Router } from 'express';
import {
  getDailyReservationsReport,
  getDashboardSummary,
  getMonthlyRevenueReport,
  getOccupancyReport,
} from '../controllers/reportController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard-summary', authenticateToken, authorizeRoles('ADMIN'), getDashboardSummary);
router.get('/daily-reservations', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), getDailyReservationsReport);
router.get('/monthly-revenue', authenticateToken, authorizeRoles('ADMIN'), getMonthlyRevenueReport);
router.get('/occupancy', authenticateToken, authorizeRoles('ADMIN'), getOccupancyReport);

export default router;