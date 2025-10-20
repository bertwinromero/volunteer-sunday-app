import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import { AuthContextType, Profile, UserRole } from '../types';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...');
        const session = await authService.getSession();
        console.log('[AuthContext] Session:', session ? 'Found' : 'None');
        setSession(session);

        if (session?.user) {
          console.log('[AuthContext] Fetching profile for user:', session.user.id);
          const profile = await authService.getCurrentProfile();
          console.log('[AuthContext] Profile:', profile);
          setUser(profile);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
      } finally {
        console.log('[AuthContext] Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event);
        setSession(session);

        if (session?.user) {
          try {
            console.log('[AuthContext] Fetching profile after auth change...');
            const profile = await authService.getCurrentProfile();
            console.log('[AuthContext] Profile fetched:', profile);
            setUser(profile);
          } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            setUser(null);
          }
        } else {
          console.log('[AuthContext] No session, clearing user');
          setUser(null);
        }

        console.log('[AuthContext] Setting loading to false (auth change)');
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    middleName: string | null,
    lastName: string,
    role: UserRole = 'volunteer'
  ) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, firstName, middleName, lastName, role);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
