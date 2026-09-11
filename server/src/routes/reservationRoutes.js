import { Router } from 'express';
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  createReservation,
  getReservation,
  listActiveReservations,
  listMyReservations,
  listReservations,
} from '../controllers/reservationController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), listReservations);
router.get('/my', authenticateToken, listMyReservations);
router.get('/my-reservations', authenticateToken, listMyReservations);
router.get('/active', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), listActiveReservations);
router.get('/:id', authenticateToken, getReservation);

router.post('/', authenticateToken, authorizeRoles('GUEST', 'ADMIN', 'RECEPTIONIST'), createReservation);

router.put('/:id/confirm', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), confirmReservation);
router.put('/:id/cancel', authenticateToken, authorizeRoles('GUEST', 'ADMIN', 'RECEPTIONIST'), cancelReservation);
router.post('/:id/check-in', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), checkInReservation);
router.post('/:id/check-out', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), checkOutReservation);

export default router;