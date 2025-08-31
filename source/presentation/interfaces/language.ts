/**
 * Language Presentation Interfaces
 * 
 * All language-related interfaces for the presentation layer.
 */

import { ReactNode } from 'react';

// ============================================================================
// LANGUAGE CONTEXT INTERFACES
// ============================================================================

/**
 * Language context type
 */
export interface LanguageContextType {
  t: (key: string) => string;
  currentLanguage: string;
  setLanguage: (language: string) => void;
  formatTranslation: (key: string, variables: Record<string, string>) => string;
}

/**
 * Language provider props
 */
export interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language selector props
 */
export interface LanguageSelectorProps {
  style?: Record<string, unknown>;
}
