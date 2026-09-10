import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children?: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-shell py-24 text-center text-muted" role="status">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}
