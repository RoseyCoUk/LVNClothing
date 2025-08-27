import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { adminAPI } from '../lib/admin-api';

interface AdminRole {
  role: string;
  permissions: string[];
  is_active: boolean;
}

interface AdminContextType {
  isAdmin: boolean;
  adminRole: AdminRole | null;
  loading: boolean;
  checkPermission: (resource: string, action?: string) => boolean;
  refreshAdminRole: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  const checkPermission = (resource: string, action: string = 'read'): boolean => {
    if (!adminRole || !adminRole.is_active) return false;
    
    // Check for admin_access permission (full access)
    if (adminRole.permissions.includes('admin_access')) return true;
    
    // Check for specific resource permission
    const permissionName = `${action}_${resource}`;
    return adminRole.permissions.includes(permissionName);
  };

  const refreshAdminRole = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use the admin API client to get admin role
      try {
        const result = await adminAPI.getAdminRole();
        if (result.role) {
          setAdminRole(result.role);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error('Error fetching admin role:', error);
        setIsAdmin(false);
        setAdminRole(null);
      }
    } catch (error) {
      console.error('Error fetching admin role:', error);
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshAdminRole();
    } else {
      setIsAdmin(false);
      setAdminRole(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const value: AdminContextType = {
    isAdmin,
    adminRole,
    loading,
    checkPermission,
    refreshAdminRole,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
