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
  // Admin Products Management
  products: {
    checkProductPermission: (action: string) => boolean;
    canManageProducts: boolean;
    canManageBundles: boolean;
    canManageImages: boolean;
    canSyncPrintful: boolean;
  };
  // Direct permission properties for easier access
  canManageProducts: boolean;
  canManageBundles: boolean;
  canManageImages: boolean;
  canSyncPrintful: boolean;
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
    // Simplified permission system for now
    // Allow authenticated users to access basic admin features
    if (!isAuthenticated || !user) return false;
    
    // For now, allow access to products, bundles, images, and printful for authenticated users
    if (['products', 'bundles', 'images', 'printful'].includes(resource)) {
      return true;
    }
    
    // Check admin role permissions if they exist
    if (adminRole && adminRole.is_active) {
      // Check for admin_access permission (full access)
      if (adminRole.permissions.includes('admin_access')) return true;
      
      // Check for specific resource permission - handle view_analytics correctly
      let permissionName;
      if (resource === 'view_analytics') {
        // For view_analytics, check if user has view_analytics permission
        permissionName = 'view_analytics';
      } else {
        // For other resources, use the standard format
        permissionName = `${action}_${resource}`;
      }
      
      // Debug logging
      console.log('Checking permission:', {
        resource,
        action,
        permissionName,
        availablePermissions: adminRole.permissions,
        hasPermission: adminRole.permissions.includes(permissionName)
      });
      
      return adminRole.permissions.includes(permissionName);
    }
    
    // Fallback: allow basic access for authenticated users
    return true;
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
          console.log('No admin role found');
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

  // Calculate product permissions
  const productPermissions = {
    checkProductPermission: (action: string) => {
      // Simplified: allow all authenticated users to manage products
      if (!isAuthenticated || !user) return false;
      

      
      return true;
    },
    canManageProducts: () => {
      if (!isAuthenticated || !user) return false;
      return true;
    },
    canManageBundles: () => {
      if (!isAuthenticated || !user) return false;
      return true;
    },
    canManageImages: () => {
      if (!isAuthenticated || !user) return false;
      return true;
    },
    canSyncPrintful: () => {
      if (!isAuthenticated || !user) return false;
      return true;
    },
  };

  const value: AdminContextType = {
    isAdmin,
    adminRole,
    loading,
    checkPermission,
    refreshAdminRole,
    products: {
      checkProductPermission: productPermissions.checkProductPermission,
      canManageProducts: productPermissions.canManageProducts(),
      canManageBundles: productPermissions.canManageBundles(),
      canManageImages: productPermissions.canManageImages(),
      canSyncPrintful: productPermissions.canSyncPrintful(),
    },
    // Direct permission properties
    canManageProducts: productPermissions.canManageProducts(),
    canManageBundles: productPermissions.canManageBundles(),
    canManageImages: productPermissions.canManageImages(),
    canSyncPrintful: productPermissions.canSyncPrintful(),
  };



  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
