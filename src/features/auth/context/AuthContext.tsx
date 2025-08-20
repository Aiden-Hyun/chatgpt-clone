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

  console.log('[AUTH] 🔄 AuthProvider render - Component ID:', Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    console.log('[AUTH] 🚀 useEffect triggered - Component ID:', Math.random().toString(36).substr(2, 9));
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] 📞 Getting initial session...');
        const { data } = await supabase.auth.getSession();
        console.log('[AUTH] ✅ Initial session result:', { 
          hasSession: !!data.session, 
          userId: data.session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (mounted) {
          console.log('[AUTH] 🔧 Setting session state...');
          setSession(data.session);
          setIsLoading(false);
          console.log('[AUTH] ✅ Session set, loading complete');
        } else {
          console.log('[AUTH] ⚠️ Component unmounted during session fetch');
        }
      } catch (error) {
        console.error('[AUTH] ❌ Error getting initial session:', error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
          console.log('[AUTH] ✅ Error handled, loading complete');
        }
      }
    };

    console.log('[AUTH] 🎯 Starting auth initialization...');
    initializeAuth();

    console.log('[AUTH] 📡 Setting up auth state change listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] 🔔 Auth state change event:', { 
        event, 
        hasSession: !!session, 
        userId: session?.user?.id,
        mounted,
        timestamp: new Date().toISOString()
      });
      
      if (mounted) {
        // Handle logout events more explicitly
        if (event === 'SIGNED_OUT') {
          console.log('[AUTH] 🚪 Handling sign out...');
          setSession(null);
          setIsLoading(false);
          console.log('[AUTH] ✅ Signed out, loading complete');
        } else {
          console.log('[AUTH] 🔄 Handling session update...');
          setSession(session);
          setIsLoading(false);
          console.log('[AUTH] ✅ Session updated, loading complete');
        }
      } else {
        console.log('[AUTH] ⚠️ Auth state change ignored - component unmounted');
      }
    });

    return () => {
      console.log('[AUTH] 🚨🚨🚨 CLEANUP TRIGGERED - This is where the loop starts! 🚨🚨🚨');
      console.log('[AUTH] 🧹 Cleanup - unmounting component, mounted:', mounted);
      console.log('[AUTH] 📊 Cleanup state:', { 
        session: !!session, 
        isLoading,
        timestamp: new Date().toISOString()
      });
      mounted = false;
      subscription.unsubscribe();
      console.log('[AUTH] ✅ Cleanup complete');
    };
  }, []);

  console.log('[AUTH] 📊 Render state:', { 
    hasSession: !!session, 
    isLoading,
    sessionId: session?.user?.id,
    timestamp: new Date().toISOString()
  });

  // 🎯 STEP 1: Memoize AuthContext value to prevent unnecessary re-renders
  const value = useMemo(() => {
    console.log('[AUTH] 🎯 Creating memoized value');
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
