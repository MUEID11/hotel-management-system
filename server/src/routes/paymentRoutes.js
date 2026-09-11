import { Router } from 'express';
import {
  listAllPayments,
  listPaymentsForReservation,
  recordPayment,
} from '../controllers/paymentController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN'), listAllPayments);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), recordPayment);
router.get(
  '/reservation/:reservationId',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'),
  listPaymentsForReservation
);

export default router;