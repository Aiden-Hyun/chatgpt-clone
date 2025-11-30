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
      logger.info("Initializing authentication system");

      await executeWithLoading(
        async () => {
          const { data } = await supabase.auth.getSession();

          if (data.session) {
            logger.info(
              `Found existing session for user ${
                data.session.user.id
              } (expires: ${new Date(
                data.session.expires_at * 1000
              ).toLocaleString()})`
            );
          } else {
            logger.info("No existing session found");
          }

          if (mounted) {
            setSession(data.session);
          }

          return data.session;
        },
        {
          onError: (error) => {
            logger.error("Auth initialization failed", {
              error: error instanceof Error ? error.message : "Unknown error",
            });
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
      // Remove verbose auth state change log - only log meaningful events

      if (mounted) {
        // Handle logout events more explicitly
        if (event === AUTH_EVENTS.SIGNED_OUT) {
          logger.info("User signed out");
          setSession(null);
        } else if (event === AUTH_EVENTS.TOKEN_REFRESHED) {
          logger.info(`Session token refreshed for user ${session?.user?.id}`);
          setSession(session);
        } else if (event === AUTH_EVENTS.SIGNED_IN) {
          logger.info(
            `User signed in successfully: ${session?.user?.email} (ID: ${session?.user?.id})`
          );
          setSession(session);

          // Auto-cancel any pending deletion request on sign-in
          if (session) {
            supabase.functions
              .invoke("account-deletion", { body: { action: "cancel" } })
              .then(({ data, error }) => {
                if (error) {
                  // 404 means no pending request - that's fine
                  if (!error.message?.includes("404")) {
                    logger.warn("Failed to auto-cancel deletion request", {
                      error,
                    });
                  }
                } else if (data?.status === "cancelled") {
                  logger.info(
                    "Auto-cancelled pending account deletion on sign-in"
                  );
                }
              })
              .catch((err) => {
                logger.warn("Error checking deletion status on sign-in", {
                  err,
                });
              });
          }
        } else {
          logger.debug(
            `Auth state changed: ${event} (session: ${
              !!session ? "active" : "none"
            })`
          );
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
