// Bridge Auth Context for testing /source implementation with existing app session
// This bridges the existing /src auth system with /source components for testing

import React, { createContext, useContext, useMemo } from 'react';
import { BridgeAuthContextValue, BridgeAuthProviderProps } from '../types/AuthTypes';
import { SessionConverter } from '../utils/SessionConverter';

const BridgeAuthContext = createContext<BridgeAuthContextValue | undefined>(undefined);

/**
 * Bridge Auth Provider that uses the existing app's session
 * This allows testing /source components without setting up the full /source session system
 */
export function BridgeAuthProvider({ children, existingSession, existingIsLoading }: BridgeAuthProviderProps) {
  // Convert external session to business session using SessionConverter
  const businessSession = useMemo(() => {
    if (!existingSession) return null;
    return SessionConverter.toBusinessSession(existingSession);
  }, [existingSession]);

  const value: BridgeAuthContextValue = {
    session: businessSession,
    isLoading: existingIsLoading
  };

  return (
    <BridgeAuthContext.Provider value={value}>
      {children}
    </BridgeAuthContext.Provider>
  );
}

/**
 * Hook to access bridged auth context
 * Provides same interface as regular useAuth for compatibility
 */
export function useAuth(): BridgeAuthContextValue {
  const context = useContext(BridgeAuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within a BridgeAuthProvider');
  }
  
  return context;
}
