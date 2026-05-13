import { Navigate, useLocation } from 'react-router-dom';
import { clearTokens, hasSession } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from './LoadingScreen';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const sessionQuery = useAuth();

  if (!hasSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (sessionQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (sessionQuery.isError) {
    clearTokens();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}