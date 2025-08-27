// Bridge Auth Context for testing /source implementation with existing app session
// This bridges the existing /src auth system with /source components for testing

import { Session } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext } from 'react';

interface BridgeAuthContextValue {
  session: Session | null;
  isLoading: boolean;
}

const BridgeAuthContext = createContext<BridgeAuthContextValue | undefined>(undefined);

interface BridgeAuthProviderProps {
  children: ReactNode;
  existingSession: Session | null;
  existingIsLoading: boolean;
}

/**
 * Bridge Auth Provider that uses the existing app's session
 * This allows testing /source components without setting up the full /source session system
 */
export function BridgeAuthProvider({ children, existingSession, existingIsLoading }: BridgeAuthProviderProps) {
  const value: BridgeAuthContextValue = {
    session: existingSession,
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
