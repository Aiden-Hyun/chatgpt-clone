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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🎯 STEP 1: Memoize AuthContext value to prevent unnecessary re-renders
  const value = useMemo(() => {
    if (__DEV__) {
      console.log('🔧 [AUTH-CONTEXT] Value memoization triggered', {
        session: session ? 'authenticated' : 'null',
        isLoading,
        note: 'This should only log when session or isLoading actually change'
      });
    }
    return { session, isLoading };
  }, [session, isLoading]); // Only recreate when these actually change

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
