import React, { createContext, ReactNode, useContext } from 'react';

import { ILogger } from '../../../interfaces/shared';
import { useBusinessContext } from '../../../shared/BusinessContextProvider';

/**
 * Interface for UI component-specific context
 */
interface ComponentsContextValue {
  logger: ILogger;
}

/**
 * Context for UI component-specific dependencies
 */
const ComponentsContext = createContext<ComponentsContextValue | undefined>(undefined);

/**
 * Props for ComponentsProvider
 */
interface ComponentsProviderProps {
  children: ReactNode;
}

/**
 * Provider for UI component-specific dependencies
 * 
 * This provider integrates with BusinessContextProvider to access any required services
 * and exposes them to UI components.
 */
export function ComponentsProvider({ children }: ComponentsProviderProps) {
  const { logger } = useBusinessContext();

  const value: ComponentsContextValue = {
    logger
  };

  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
}

/**
 * Hook to access UI component-specific context
 */
export function useComponentsContext(): ComponentsContextValue {
  const context = useContext(ComponentsContext);
  
  if (context === undefined) {
    throw new Error('useComponentsContext must be used within a ComponentsProvider');
  }
  
  return context;
}
