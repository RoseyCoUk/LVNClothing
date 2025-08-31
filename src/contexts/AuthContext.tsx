import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { handleError, logError, AuthenticationError } from '../lib/error-handler';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
    
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          logError(error, 'getInitialSession');
          // Don't throw here, just log the error and continue
        } else {

          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('💥 Unexpected error getting initial session:', error);
        logError(error, 'getInitialSession');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Log session details for debugging
          if (session) {

          }
        } catch (error) {
          console.error('💥 Error handling auth state change:', error);
          logError(error, 'authStateChange');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {

      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        logError(error, 'signIn', { email });
        return { error };
      }
      
      if (data.session) {

        setSession(data.session);
        setUser(data.session.user);
      }
      
      return { error: null };
    } catch (error) {
      console.error('💥 Unexpected sign in error:', error);
      logError(error, 'signIn', { email });
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        logError(error, 'signUp', { email });
        return { error };
      }
      
      if (data.session) {

        setSession(data.session);
        setUser(data.session.user);
      } else {

      }
      
      return { error: null };
    } catch (error) {
      console.error('💥 Unexpected sign up error:', error);
      logError(error, 'signUp', { email });
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      logError(error, 'signOut');
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session refresh error:', error);
        logError(error, 'refreshSession');
        return;
      }
      
      if (refreshedSession) {
        console.log('✅ Session refreshed successfully');
        setSession(refreshedSession);
        setUser(refreshedSession.user);
      } else {
        console.log('ℹ️ No session to refresh');
      }
    } catch (error) {
      console.error('💥 Unexpected session refresh error:', error);
      logError(error, 'refreshSession');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    isAuthenticated: !!user && !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
