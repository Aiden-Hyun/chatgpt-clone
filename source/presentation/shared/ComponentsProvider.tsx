import React from 'react';

import { ComponentsProvider as UIComponentsProvider } from '../components/ui/context/ComponentsContext';
import { ComponentsProviderProps } from '../interfaces/components';

/**
 * Provider that wraps all UI component providers
 * 
 * This provider ensures that all UI components have access to their required dependencies
 */
export function ComponentsProvider({ children }: ComponentsProviderProps) {
  return (
    <UIComponentsProvider>
      {children}
    </UIComponentsProvider>
  );
}
