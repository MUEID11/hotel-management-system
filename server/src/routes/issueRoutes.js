import { Router } from 'express';
import {
  createIssue,
  listIssues,
  updateIssueStatus,
} from '../controllers/issueController.js';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/authMiddleware.js';

const router = Router();

// Any authenticated user (Admin, Receptionist, Guest) can report a problem
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'),
  createIssue
);

// Guests view their own issues; Staff view all
router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST', 'GUEST'),
  listIssues
);

// Only staff can update status / mark resolved
router.put(
  '/:id/status',
  authenticateToken,
  authorizeRoles('ADMIN', 'RECEPTIONIST'),
  updateIssueStatus
);

export default router;
