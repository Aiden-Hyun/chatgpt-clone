import React, { createContext, useContext } from 'react';

import { ComponentsContextValue, ComponentsProviderProps } from '../../../interfaces/components';
import { useBusinessContext } from '../../../shared/BusinessContextProvider';

/**
 * Context for UI component-specific dependencies
 */
const ComponentsContext = createContext<ComponentsContextValue | undefined>(undefined);

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
