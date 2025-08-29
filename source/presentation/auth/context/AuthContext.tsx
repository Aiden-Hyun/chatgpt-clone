import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { AuthContextType, AuthProviderProps } from '../../interfaces/auth';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { useAuthStateMonitor } from '../hooks/useAuthStateMonitor';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { useCaseFactory } = useBusinessContext();
  
  // Use business layer auth state monitoring
  const { isMonitoring } = useAuthStateMonitor();

  useEffect(() => {
    console.log('🔑 [AuthContext] Starting auth initialization with business layer');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Use business layer to get session
        const getSessionUseCase = useCaseFactory.createGetSessionUseCase();
        const result = await getSessionUseCase.execute({ 
          validateExpiry: false,
          refreshIfExpired: false 
        });
        
        console.log('📋 [AuthContext] Initial session result:', { 
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
        console.error('Error getting initial session:', error);
        if (mounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [useCaseFactory]);

  // Memoize AuthContext value to prevent unnecessary re-renders
  const value = useMemo(() => {
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
