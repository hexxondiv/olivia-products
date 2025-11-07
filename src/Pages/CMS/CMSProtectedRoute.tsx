import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCMSAuth } from '../../Contexts/CMSAuthContext';
import { Spinner } from 'react-bootstrap';

interface CMSProtectedRouteProps {
  children: ReactNode;
}

export const CMSProtectedRoute: React.FC<CMSProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useCMSAuth();

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

  return <>{children}</>;
};

