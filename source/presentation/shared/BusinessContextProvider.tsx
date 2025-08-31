// Business Context Provider - React Context for dependency injection
// Follows layered architecture: Presentation layer manages its dependencies

import React, { createContext, useContext, useMemo } from 'react';

import { BusinessLayerProvider } from '../../business/shared/BusinessLayerProvider';
import { UseCaseFactory } from '../../business/shared/UseCaseFactory';
import { BusinessContextValue, BusinessContextProviderProps } from '../interfaces/shared';

const BusinessContext = createContext<BusinessContextValue | null>(null);

/**
 * React Context Provider for business layer dependencies
 * Replaces service locator antipattern with proper React context injection
 */
export function BusinessContextProvider({ children }: BusinessContextProviderProps) {
  console.log('🔍 BusinessContextProvider: Starting render');
  
  // Create business provider once and memoize
  const businessProvider = useMemo(() => {
    console.log('🔍 BusinessContextProvider: Creating BusinessLayerProvider');
    return new BusinessLayerProvider();
  }, []);
  
  // Access token helper can be enhanced to use session repo/use case later
  const getAccessToken = useMemo(() => async (): Promise<string | null> => {
    try {
      const result = await businessProvider
        .getSessionRepository()
        .refresh();
      if (result.success && result.session) {
        return result.session.accessToken || null;
      }
      const current = await businessProvider.getSessionRepository().get();
      return current?.accessToken || null;
    } catch {
      return null;
    }
  }, [businessProvider]);
  
  // Create context value with stable reference
  const contextValue = useMemo(() => ({
    useCaseFactory: businessProvider.getUseCaseFactory(),
    businessProvider,
    clipboard: businessProvider.getClipboardAdapter(),
    languageService: businessProvider.getLanguageService(),
    toastService: businessProvider.getToastService(),
    alertService: businessProvider.getAlertService(),
    navigationService: businessProvider.getNavigationService(),
    navigationTracker: businessProvider.getNavigationTracker(),
    storageService: businessProvider.getStorageService(),
    secureStorageService: businessProvider.getSecureStorageService(),
    getAccessToken
  }), [businessProvider, getAccessToken]);

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
}

/**
 * Hook to access business dependencies
 * Provides type-safe access to use case factory
 */
export function useBusinessContext(): BusinessContextValue {
  const context = useContext(BusinessContext);
  
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessContextProvider');
  }
  
  return context;
}

/**
 * Hook to access use case factory directly
 * Convenience hook for most common use case
 */
export function useUseCaseFactory(): UseCaseFactory {
  const { useCaseFactory } = useBusinessContext();
  return useCaseFactory;
}