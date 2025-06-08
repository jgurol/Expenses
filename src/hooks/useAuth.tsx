import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

export type UserRole = 'admin' | 'bookkeeper' | 'classifier';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: UserRole[];
  userTimezone: string;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isBookkeeper: boolean;
  isClassifier: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data?.map(item => item.role as UserRole) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  const fetchUserTimezone = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user timezone:', error);
        return 'UTC';
      }
      
      return data?.timezone || 'UTC';
    } catch (error) {
      console.error('Error fetching user timezone:', error);
      return 'UTC';
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        // Clean up on error
        cleanupAuthState();
      }
      
      console.log('Initial session:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchUserRoles(session.user.id),
          fetchUserTimezone(session.user.id)
        ]).then(([roles, timezone]) => {
          setUserRoles(roles);
          setUserTimezone(timezone);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer role and timezone fetching to avoid potential issues
          setTimeout(async () => {
            const [roles, timezone] = await Promise.all([
              fetchUserRoles(session.user.id),
              fetchUserTimezone(session.user.id)
            ]);
            setUserRoles(roles);
            setUserTimezone(timezone);
            setLoading(false);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUserRoles([]);
          setUserTimezone('UTC');
          cleanupAuthState(); // Security: Clean up on sign out
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    try {
      console.log('Signing in with password:', email);
      
      // Security: Clean up before sign in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout attempt:', err);
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        cleanupAuthState(); // Clean up on error
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      cleanupAuthState(); // Clean up on exception
      return { error };
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      console.log('Signing up with password:', email, 'with redirect:', redirectUrl);
      
      // Security: Clean up before sign up
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        cleanupAuthState(); // Clean up on error
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up exception:', error);
      cleanupAuthState(); // Clean up on exception
      return { error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      console.log('Sending magic link to:', email, 'with redirect:', redirectUrl);
      
      // Security: Clean up before magic link
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('Magic link error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Magic link exception:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      console.log('Sending password reset to:', email, 'with redirect:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Password reset error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('Password reset exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Security: Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout error (ignoring):', err);
      }
      
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setUserTimezone('UTC');
      
      // Security: Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force cleanup and redirect even on error
      cleanupAuthState();
      window.location.href = '/auth';
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = hasRole('admin');
  const isBookkeeper = hasRole('bookkeeper') || isAdmin;
  const isClassifier = hasRole('classifier') || isAdmin;

  const value = {
    user,
    session,
    userRoles,
    userTimezone,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    resetPassword,
    signOut,
    hasRole,
    isAdmin,
    isBookkeeper,
    isClassifier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
