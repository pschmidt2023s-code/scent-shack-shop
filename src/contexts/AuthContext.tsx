import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; needsMfa?: boolean; challengeId?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
  supabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error } = await api.auth.me();
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await api.auth.register(email, password, fullName);
      if (error) return { error: { message: error } };
      if (data?.user) setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await api.auth.login(email, password);
      if (error) return { error: { message: error } };
      if (data?.user) setUser(data.user);
      return { error: null, needsMfa: false, challengeId: undefined };
    } catch (error: any) {
      return { error: { message: error.message }, needsMfa: false, challengeId: undefined };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading, supabaseConnected: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
