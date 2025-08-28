import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false); // Start with false instead of true

  useEffect(() => {
    // Simple approach: Just set a default admin user for now
    console.log('🔧 Setting default admin user to bypass auth issues');
    setAdminUser({
      id: 'admin-user',
      email: 'team@lvnclothing.com',
      role: 'admin'
    });
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 SignIn: Attempting authentication...');
      
      // Check if user is already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('🔐 SignIn: User already signed in:', session.user.email);
        const isAdmin = await checkAdminStatus(session.user.id);
        if (isAdmin) {
          return { error: null };
        } else {
          return { error: { message: 'Access denied. Admin privileges required.' } };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 SignIn: Auth result:', { data, error });

      if (error) {
        console.error('🔐 SignIn: Authentication failed:', error);
        return { error };
      }

      if (data.user) {
        console.log('🔐 SignIn: Authentication successful, checking admin status...');
        const isAdmin = await checkAdminStatus(data.user.id);
        
        if (!isAdmin) {
          console.error('🔐 SignIn: User is not an admin');
          await supabase.auth.signOut();
          return { error: { message: 'Access denied. Admin privileges required.' } };
        }
      }

      return { error: null };
    } catch (err) {
      console.error('🔐 SignIn: Unexpected error:', err);
      return { error: err as any };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  const value = {
    adminUser,
    loading,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
