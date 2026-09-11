import { useAuthContext } from '../context/AuthContext.jsx';

// Convenience hook exposing the authenticated user session.
export function useAuth() {
  return useAuthContext();
}