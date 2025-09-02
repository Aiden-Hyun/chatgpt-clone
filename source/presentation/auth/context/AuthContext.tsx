/**
 * Simplified Auth Context
 * Matches /src reference pattern but uses business layer
 * Eliminates complex state synchronization and monitoring
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { UserSession } from '../../../business/interfaces/session';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { AuthContextType, AuthProviderProps } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Simplified Auth Provider
 * Pattern matches /src/features/auth/context/AuthContext.tsx
 * Uses business layer GetAuthStateUseCase and MonitorAuthStateUseCase
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { useCaseFactory } = useBusinessContext();

  useEffect(() => {
    Logger.info('AuthProvider: Starting auth initialization');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session using business layer
        const getAuthStateUseCase = useCaseFactory.createGetAuthStateUseCase();
        const result = await getAuthStateUseCase.execute();
        
        Logger.debug('AuthProvider: Initial auth state', { 
          hasSession: !!result.session,
          success: result.success 
        });
        
        if (mounted) {
          if (result.success && result.session) {
            setSession(result.session);
          } else {
            setSession(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        Logger.error('AuthProvider: Auth initialization error', { error });
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    // Start monitoring auth state changes using business layer
    const startMonitoring = async () => {
      try {
        const monitorAuthStateUseCase = useCaseFactory.createMonitorAuthStateUseCase();
        const monitorResult = await monitorAuthStateUseCase.execute();

        if (monitorResult.success) {
          Logger.info('AuthProvider: Auth monitoring started');
          // The business layer will handle auth state changes and update the session repository
          // We'll poll for changes periodically to keep the UI in sync
          const pollInterval = setInterval(async () => {
            if (mounted) {
              try {
                const getAuthStateUseCase = useCaseFactory.createGetAuthStateUseCase();
                const currentResult = await getAuthStateUseCase.execute();
                
                if (currentResult.success) {
                  const newSession = currentResult.session;
                  setSession(prevSession => {
                    // Only update if session actually changed
                    if (!prevSession && !newSession) return prevSession;
                    if (!prevSession && newSession) return newSession;
                    if (prevSession && !newSession) return null;
                    if (prevSession && newSession && prevSession.userId === newSession.userId) {
                      return prevSession; // Same session, don't update
                    }
                    return newSession;
                  });
                }
              } catch (error) {
                Logger.warn('AuthProvider: Polling error', { error });
              }
            }
          }, 5000); // Poll every 5 seconds

          return () => {
            clearInterval(pollInterval);
            if (monitorResult.unsubscribe) {
              monitorResult.unsubscribe();
            }
          };
        } else {
          Logger.warn('AuthProvider: Failed to start monitoring', { 
            error: monitorResult.error 
          });
        }
      } catch (error) {
        Logger.error('AuthProvider: Monitoring setup error', { error });
      }
    };

    // Initialize auth and start monitoring
    initializeAuth();
    const cleanupMonitoring = startMonitoring();

    return () => {
      mounted = false;
      if (cleanupMonitoring) {
        cleanupMonitoring.then(cleanup => cleanup?.());
      }
    };
  }, [useCaseFactory]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => {
    return { session, isLoading };
  }, [session, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Matches /src reference pattern
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
