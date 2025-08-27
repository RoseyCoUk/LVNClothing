import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredAction?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredAction = 'read'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, adminRole, loading: adminLoading, checkPermission } = useAdmin();

  // Show loading state while checking authentication and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to login if not an admin
  if (!isAdmin || !adminRole) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !checkPermission(requiredPermission, requiredAction)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this resource.
          </p>
          <p className="text-sm text-gray-500">
            Required permission: {requiredAction}_{requiredPermission}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
