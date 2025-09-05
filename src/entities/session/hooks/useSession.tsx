// src/entities/session/hooks/useSession.ts
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLoadingState } from "../../../shared/hooks/useLoadingState";
import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";
import { AUTH_EVENTS } from "../model/constants";
import type { AuthContextType, Session } from "../model/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const logger = getLogger("AuthProvider");
  const [session, setSession] = useState<Session | null>(null);
  const {
    loading: isLoading,
    error: _loadingError,
    executeWithLoading,
  } = useLoadingState({ initialLoading: true });

  useEffect(() => {
    logger.debug("Starting auth initialization");
    let mounted = true;

    const initializeAuth = async () => {
      await executeWithLoading(
        async () => {
          const { data } = await supabase.auth.getSession();
          logger.debug("Initial session result", {
            hasSession: !!data.session,
          });

          if (mounted) {
            setSession(data.session);
          }

          return data.session;
        },
        {
          onError: (error) => {
            logger.error("Auth initialization error", { error });
            if (mounted) {
              setSession(null);
            }
          },
        }
      );
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug("Auth state change", {
        event,
        hasSession: !!session,
      });

      if (mounted) {
        // Handle logout events more explicitly
        if (event === AUTH_EVENTS.SIGNED_OUT) {
          logger.info("User session expired or signed out");
          setSession(null);
        } else if (event === AUTH_EVENTS.TOKEN_REFRESHED) {
          logger.info("Token refreshed successfully", {
            expiresAt: session?.expires_at,
          });
          setSession(session);
        } else if (event === AUTH_EVENTS.SIGNED_IN) {
          logger.info("User signed in", {
            userId: session?.user?.id,
            expiresAt: session?.expires_at,
          });
          setSession(session);
        } else {
          setSession(session);
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
