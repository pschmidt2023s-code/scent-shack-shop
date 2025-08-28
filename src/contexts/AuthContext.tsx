
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; needsMfa?: boolean; challengeId?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
  supabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection check:', { data, error });
        setSupabaseConnected(!error);
        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        setSupabaseConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting sign up for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: fullName ? { full_name: fullName } : undefined
        }
      });
      console.log('Sign up result:', { data, error });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Sign in result:', { data, error });
      
      // Check if MFA is required
      if (error && error.message.includes('MFA')) {
        // User has MFA enabled, need to handle challenge
        try {
          const { data: mfaData, error: mfaError } = await supabase.auth.mfa.listFactors();
          if (mfaError) throw mfaError;
          
          if (mfaData.totp && mfaData.totp.length > 0) {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
              factorId: mfaData.totp[0].id
            });
            
            if (challengeError) throw challengeError;
            
            return { 
              error: null, 
              needsMfa: true, 
              challengeId: challengeData.id 
            };
          }
        } catch (mfaError) {
          console.error('MFA challenge error:', mfaError);
          return { error: mfaError };
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Attempting sign out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signUp,
      signIn,
      signOut,
      loading,
      supabaseConnected
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export supabase client for components that need direct access
export { supabase };
