import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { LanguageContextType, LanguageProviderProps } from '../interfaces/language';
import { useBusinessContext } from '../shared/BusinessContextProvider';

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { languageService } = useBusinessContext();
  const [currentLanguage, setCurrentLanguageState] = useState(languageService.getCurrentLanguage());

  // Effect to initialize language from storage
  useEffect(() => {
    // Language service already initializes with stored language
    setCurrentLanguageState(languageService.getCurrentLanguage());
  }, [languageService]);

  // Memoize translation function to prevent recreation
  const t = useCallback((key: string): string => {
    return languageService.translate(key);
  }, [languageService, currentLanguage]); // Recreate when language changes

  // Memoize formatTranslation function
  const formatTranslation = useCallback((key: string, variables: Record<string, string>): string => {
    return languageService.formatTranslation(key, variables);
  }, [languageService, currentLanguage]); // Recreate when language changes

  // Memoize setLanguage function
  const setLanguage = useCallback((language: string): void => {
    const result = languageService.setLanguage(language);
    if (result.isSuccess()) {
      setCurrentLanguageState(language);
    }
  }, [languageService]);

  // Memoize LanguageContext value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    t,
    currentLanguage,
    setLanguage,
    formatTranslation,
  }), [t, currentLanguage, setLanguage, formatTranslation]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};
