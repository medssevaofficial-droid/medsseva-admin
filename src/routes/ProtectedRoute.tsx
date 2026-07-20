import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import { UserRole } from '@/types';
import { usePermission } from '@/hooks/usePermission';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  permission?: string; // e.g. 'bookings.view'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  permission,
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { can, isSuperAdmin } = usePermission();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 // Super Admin bypasses all checks
  if (isSuperAdmin) return <>{children}</>;

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};