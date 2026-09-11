import { Router } from 'express';
import {
  getCurrentUser,
  loginUser,
  registerNewGuest,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', (request, response) => {
  response.json({
    success: true,
    message: 'Grand Horizon Hotel Management System — Auth API',
    endpoints: {
      login: { method: 'POST', path: '/api/auth/login' },
      register: { method: 'POST', path: '/api/auth/register' },
      me: { method: 'GET', path: '/api/auth/me', note: 'Requires Bearer JWT token' },
    },
    webUi: {
      login: 'http://localhost:5173/login',
      register: 'http://localhost:5173/register',
    },
  });
});

router.get('/register', (request, response) => {
  response.json({
    success: true,
    message: 'Authentication registration endpoint is active. Submit a POST request with JSON body (email, password, firstName, lastName, phone, documentNumber). Web registration UI is available at http://localhost:5173/register',
    method: 'POST',
    endpoint: '/api/auth/register',
    frontendUrl: 'http://localhost:5173/register',
    requiredFields: ['email', 'password', 'firstName', 'lastName'],
    optionalFields: ['phone', 'documentNumber', 'country'],
  });
});

router.get('/login', (request, response) => {
  response.json({
    success: true,
    message: 'Authentication login endpoint is active. Submit a POST request with JSON body (email, password). Web login UI is available at http://localhost:5173/login',
    method: 'POST',
    endpoint: '/api/auth/login',
    frontendUrl: 'http://localhost:5173/login',
    demoAccounts: [
      { email: 'admin@hotel.com', role: 'ADMIN', password: 'admin12345' },
      { email: 'front@hotel.com', role: 'RECEPTIONIST', password: 'admin12345' },
      { email: 'guest@hotel.com', role: 'GUEST', password: 'admin12345' },
    ],
  });
});

router.post('/register', registerNewGuest);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);

export default router;