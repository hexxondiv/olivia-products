import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { Spinner, Alert } from 'react-bootstrap';
import { canAccessRoute } from '../../Utils/rolePermissions';

interface CMSProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'sales' | 'support' | ('admin' | 'sales' | 'support')[];
}

export const CMSProtectedRoute: React.FC<CMSProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, loading, user } = useCMSAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cms/login" replace />;
  }

  // Check role-based access
  if (user) {
    const hasAccess = requiredRole
      ? Array.isArray(requiredRole)
        ? requiredRole.includes(user.role as any)
        : user.role === requiredRole
      : canAccessRoute(user.role as any, location.pathname);

    if (!hasAccess) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Alert variant="danger" className="m-4">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>You don't have permission to access this page.</p>
            <p className="mb-0">
              <a href="/cms">Return to Dashboard</a>
            </p>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};

