import { Router } from 'express';
import {
  getGuest,
  listGuests,
  registerWalkInGuest,
  updateGuest,
} from '../controllers/guestController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), listGuests);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST'), registerWalkInGuest);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'), getGuest);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'), updateGuest);

export default router;