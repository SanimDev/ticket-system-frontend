import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Result
            status="403"
            title="403 Forbidden"
            subTitle={`Access restricted. This page requires one of the following roles: ${allowedRoles.join(', ')}.`}
            extra={
              <Link to="/dashboard">
                <Button type="primary">Back to Dashboard</Button>
              </Link>
            }
          />
        </div>
      );
    }
  }

  return <>{children}</>;
};

