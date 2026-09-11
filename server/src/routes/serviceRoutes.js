import { Router } from 'express';
import {
  createService,
  listAllServiceOrders,
  listServiceOrders,
  listServices,
  placeServiceOrder,
  updateService,
  updateServiceOrderStatus,
} from '../controllers/serviceController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/services', listServices);
router.post('/services', authenticateToken, authorizeRoles('ADMIN'), createService);
router.put('/services/:id', authenticateToken, authorizeRoles('ADMIN'), updateService);

router.get(
  '/service-orders',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST'),
  listAllServiceOrders
);
router.post(
  '/service-orders',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'),
  placeServiceOrder
);
router.put(
  '/service-orders/:id/status',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST'),
  updateServiceOrderStatus
);
router.get(
  '/service-orders/reservation/:reservationId',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'),
  listServiceOrders
);

export default router;