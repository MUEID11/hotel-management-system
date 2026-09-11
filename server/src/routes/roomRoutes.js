import { Router } from 'express';
import {
  changeRoomStatus,
  createNewRoom,
  createNewRoomType,
  deactivateRoom,
  getSingleRoom,
  listAvailableRooms,
  listRooms,
  listRoomTypes,
  updateExistingRoom,
  updateExistingRoomType,
} from '../controllers/roomController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

// Room types (public read, admin write).
router.get('/types', listRoomTypes);
router.post('/types', authenticateToken, authorizeRoles('ADMIN'), createNewRoomType);
router.put('/types/:id', authenticateToken, authorizeRoles('ADMIN'), updateExistingRoomType);

// Rooms (public read, admin write).
router.get('/', listRooms);
router.get('/available', listAvailableRooms);
router.get('/:id', getSingleRoom);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createNewRoom);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateExistingRoom);
router.put('/:id/status', authenticateToken, authorizeRoles('ADMIN'), changeRoomStatus);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deactivateRoom);

export default router;