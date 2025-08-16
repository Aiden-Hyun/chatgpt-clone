// src/features/auth/context/AuthContext.tsx
import { Session } from '@supabase/supabase-js';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../../../shared/lib/supabase';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (__DEV__) {
            console.log('🔄 AUTH: Initial session data:', { hasSession: !!data.session, userId: data.session?.user?.id });
          }
          setSession(data.session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (__DEV__) {
          console.log('🔄 AUTH: Auth state changed', { event, hasSession: !!session, userId: session?.user?.id });
        }
        
        // Handle logout events more explicitly
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setIsLoading(false);
        } else {
          setSession(session);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🎯 STEP 1: Memoize AuthContext value to prevent unnecessary re-renders
  const value = useMemo(() => ({ session, isLoading }), [session, isLoading]); // Only recreate when these actually change

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
