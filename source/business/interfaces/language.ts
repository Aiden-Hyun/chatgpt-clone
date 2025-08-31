/**
 * Language Business Layer Interfaces and Types
 * All language and internationalization-related interfaces and types
 */

import { Result } from './shared';

// ============================================================================
// LANGUAGE ENTITIES - Language domain objects
// ============================================================================

/**
 * Language interface representing a supported language
 */
export interface LanguageInfo {
  /**
   * Language code (ISO 639-1)
   */
  code: string;
  
  /**
   * Display name of the language
   */
  name: string;
  
  /**
   * Native name of the language
   */
  nativeName: string;
  
  /**
   * Whether this language is right-to-left
   */
  isRTL: boolean;
  
  /**
   * Whether this language is currently supported
   */
  isSupported: boolean;
  
  /**
   * Flag emoji or icon for the language
   */
  flag?: string;
}

/**
 * Language entity class representing a supported language in the application
 */
export class Language {
  private readonly _code: string;
  private readonly _name: string;
  
  constructor(code: string, name: string) {
    this._code = code;
    this._name = name;
  }
  
  /**
   * Get the language code (e.g., 'en', 'es', 'ko')
   */
  public getCode(): string {
    return this._code;
  }
  
  /**
   * Get the display name of the language (e.g., 'English', 'Español', '한국어')
   */
  public getName(): string {
    return this._name;
  }
  
  /**
   * Create a Language entity from a plain object
   */
  public static fromObject(obj: { code: string; name: string }): Language {
    return new Language(obj.code, obj.name);
  }
  
  /**
   * Convert the Language entity to a plain object
   */
  public toObject(): { code: string; name: string } {
    return {
      code: this._code,
      name: this._name,
    };
  }
}

// ============================================================================
// LANGUAGE SERVICE INTERFACES - Language service abstractions
// ============================================================================

/**
 * Interface for language service operations
 */
export interface ILanguageService {
  /**
   * Get a translation for a given key
   */
  translate(key: string): string;
  
  /**
   * Get the current language code
   */
  getCurrentLanguage(): string;
  
  /**
   * Set the current language
   */
  setLanguage(languageCode: string): Result<void>;
  
  /**
   * Get all supported languages
   */
  getSupportedLanguages(): LanguageInfo[];
  
  /**
   * Format a translation with variables
   */
  formatTranslation(key: string, variables: Record<string, string>): string;
}

// ============================================================================
// LANGUAGE OPERATION RESULTS - Business operation results
// ============================================================================

/**
 * Language event types
 */
export enum LanguageEvent {
  LANGUAGE_CHANGED = 'language_changed',
  TRANSLATIONS_LOADED = 'translations_loaded',
  TRANSLATION_MISSING = 'translation_missing',
  LANGUAGE_DETECTION_FAILED = 'language_detection_failed'
}

// ============================================================================
// LANGUAGE CONSTANTS - Supported languages and defaults
// ============================================================================

/**
 * Default language code
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Supported languages (as LanguageInfo objects)
 */
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    isSupported: true,
    flag: '🇺🇸'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    isRTL: false,
    isSupported: true,
    flag: '🇪🇸'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    isRTL: false,
    isSupported: true,
    flag: '🇰🇷'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    isRTL: false,
    isSupported: true,
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    isRTL: false,
    isSupported: true,
    flag: '🇩🇪'
  }
];

/**
 * Supported languages (as Language entity classes)
 */
export const SUPPORTED_LANGUAGE_ENTITIES: Language[] = [
  new Language('en', 'English'),
  new Language('es', 'Español'),
  new Language('ko', '한국어'),
  new Language('fr', 'Français'),
  new Language('de', 'Deutsch')
];

// ============================================================================
// LANGUAGE HELPERS - Utility functions
// ============================================================================

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code && lang.isSupported);
}

/**
 * Get browser language
 */
export function getBrowserLanguage(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language.split('-')[0] || DEFAULT_LANGUAGE;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Format translation with pluralization
 */
export function formatPlural(
  count: number, 
  singular: string, 
  plural?: string
): string {
  if (count === 1) {
    return singular.replace('{count}', count.toString());
  }
  
  const pluralForm = plural || `${singular}s`;
  return pluralForm.replace('{count}', count.toString());
}
