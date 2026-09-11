import { Router } from 'express';
import {
  createStaffAccount,
  deactivateStaffAccount,
  listStaff,
} from '../controllers/staffController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN'), listStaff);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createStaffAccount);
router.put('/:id/deactivate', authenticateToken, authorizeRoles('ADMIN'), deactivateStaffAccount);

export default router;