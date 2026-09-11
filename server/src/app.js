import express from 'express';
import cors from 'cors';
import { CLIENT_URL } from './utils/constants.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';

const app = express();

const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow common local and preview URLs
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow vercel and netlify preview subdomains if specified
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (request, response) => {
  response.json({
    success: true,
    message: 'Hotel Management API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/issues', issueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;