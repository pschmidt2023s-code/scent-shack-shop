
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { sessionMonitor, securityEventMonitor } from '@/lib/session-monitor';
import SecurityWarningModal from '@/components/SecurityWarningModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; needsMfa?: boolean; challengeId?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
  supabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    let mounted = true;
    
    // Set loading to false after max 2 seconds regardless
    const maxLoadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Force loading complete after timeout');
        setLoading(false);
      }
    }, 2000);

    // Set up auth state listener FIRST to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Handle session changes for security monitoring
        if (newSession?.user && event === 'SIGNED_IN') {
          // User signed in - start session monitoring after a brief delay
          setTimeout(() => {
            startSessionMonitoring();
            
            // Check for suspicious activity
            const userAgent = navigator.userAgent;
            securityEventMonitor.checkForSuspiciousActivity(userAgent);
          }, 100);
        } else if (!newSession && event === 'SIGNED_OUT') {
          // User signed out - stop session monitoring
          sessionMonitor.stop();
          setShowSessionWarning(false);
        }
      }
    );

    // THEN check for existing session with timeout
    const checkConnection = async () => {
      try {
        // Set a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        console.log('Supabase connection check:', { data, error });
        setSupabaseConnected(!error);
        if (mounted && data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          // Start session monitoring for existing sessions
          setTimeout(() => {
            startSessionMonitoring();
          }, 100);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        if (mounted) {
          setSupabaseConnected(false);
          // Allow app to load even if Supabase fails
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Start connection check but don't block rendering
    checkConnection();

    return () => {
      mounted = false;
      clearTimeout(maxLoadingTimeout);
      subscription.unsubscribe();
      sessionMonitor.stop();
    };
  }, []);

  const startSessionMonitoring = () => {
    const handleSessionWarning = () => {
      setShowSessionWarning(true);
    };

    const handleSessionExpired = () => {
      console.warn('Session expired due to inactivity');
      signOut();
    };

    sessionMonitor.start(handleSessionWarning, handleSessionExpired);
  };

  const handleExtendSession = () => {
    sessionMonitor.extendSession();
    setShowSessionWarning(false);
  };

  const handleLogoutFromWarning = () => {
    setShowSessionWarning(false);
    signOut();
  };

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
      
      // Send registration confirmation email if signup was successful
      if (!error && data.user) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-registration-confirmation', {
            body: {
              email: email,
              name: fullName || email.split('@')[0]
            }
          });

          if (emailError) {
            console.error('Error sending registration confirmation:', emailError);
          } else {
            console.log('Registration confirmation email sent');
          }
        } catch (emailError) {
          console.error('Failed to send registration confirmation:', emailError);
        }
      }
      
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
      // Stop session monitoring and clear warning
      sessionMonitor.stop();
      setShowSessionWarning(false);
      
      // Clear any cached data
      sessionStorage.clear();
      
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
      session,
      signUp,
      signIn,
      signOut,
      loading,
      supabaseConnected
    }}>
      {children}
      <SecurityWarningModal
        isOpen={showSessionWarning}
        onExtendSession={handleExtendSession}
        onLogout={handleLogoutFromWarning}
      />
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
