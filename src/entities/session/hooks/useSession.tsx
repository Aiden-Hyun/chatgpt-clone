// src/entities/session/hooks/useSession.ts
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../shared/lib/supabase";
import { AUTH_EVENTS } from "../model/constants";
import type { AuthContextType, Session } from "../model/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("🔑 [AuthContext] Starting auth initialization");
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("📋 [AuthContext] Initial session result:", {
          hasSession: !!data.session,
        });

        if (mounted) {
          setSession(data.session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
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
      console.log("🔄 [AuthContext] Auth state change:", {
        event,
        hasSession: !!session,
      });
      if (mounted) {
        // Handle logout events more explicitly
        if (event === AUTH_EVENTS.SIGNED_OUT) {
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

  // Memoize AuthContext value to prevent unnecessary re-renders
  const value = useMemo(() => {
    return { session, isLoading };
  }, [session, isLoading]); // Only recreate when these actually change

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
