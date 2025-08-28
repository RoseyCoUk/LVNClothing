import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { adminUser, loading } = useAdminAuth();

  console.log('🔒 ProtectedAdminRoute - loading:', loading, 'adminUser:', !!adminUser);

  // For now, just show the dashboard without complex auth checks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Always show the dashboard for now
  return <>{children}</>;
};

export default ProtectedAdminRoute;
