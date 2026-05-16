import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins bypass the waiting screen. Normal users must be whitelisted.
  if (!user.isAdmin && user.status !== 'whitelisted') {
    return <Navigate to="/waiting" replace />;
  }

  return children;
};