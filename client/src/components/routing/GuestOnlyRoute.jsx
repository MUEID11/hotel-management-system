import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Spinner from '../common/Spinner.jsx';

export default function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Verifying session…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isStaff ? '/dashboard' : '/my-bookings'} replace />;
  }

  return children;
}