import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

import LandingPage from './pages/LandingPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import DashboardLayout from './components/layout/DashboardLayout.jsx';
import DashboardHome from './pages/dashboard/DashboardHome.jsx';
import RoomsManage from './pages/dashboard/RoomsManage.jsx';
import RoomTypesManage from './pages/dashboard/RoomTypesManage.jsx';
import GuestsManage from './pages/dashboard/GuestsManage.jsx';
import ReservationsManage from './pages/dashboard/ReservationsManage.jsx';
import PaymentsManage from './pages/dashboard/PaymentsManage.jsx';
import ServicesManage from './pages/dashboard/ServicesManage.jsx';
import StaffManage from './pages/dashboard/StaffManage.jsx';
import ReportsPage from './pages/dashboard/ReportsPage.jsx';

import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import GuestOnlyRoute from './components/routing/GuestOnlyRoute.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
            <Routes>
            {/* Public Showcase & Booking */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/booking" element={<BookingPage />} />

            {/* Guest Auth */}
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <RegisterPage />
                </GuestOnlyRoute>
              }
            />

            {/* Guest Bookings & My Stay */}
            <Route
              path="/my-stay"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff & Administrator Management Suite */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="rooms" element={<RoomsManage />} />
              <Route path="room-types" element={<RoomTypesManage />} />
              <Route path="guests" element={<GuestsManage />} />
              <Route path="reservations" element={<ReservationsManage />} />
              <Route path="payments" element={<PaymentsManage />} />
              <Route path="services" element={<ServicesManage />} />
              <Route path="staff" element={<StaffManage />} />
              <Route
                path="reports"
                element={
                  <ProtectedRoute roles={['ADMIN', 'RECEPTIONIST']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </NotificationProvider>
  </ErrorBoundary>
  );
}