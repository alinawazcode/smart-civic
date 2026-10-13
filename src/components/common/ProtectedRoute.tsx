import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { role } = useRole();
  const location = useLocation();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
