import { Language } from '../entities/Language';

/**
 * Default language code used when no language is set
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * All supported languages in the application
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  new Language('en', 'English'),
  new Language('es', 'Español'),
  new Language('ko', '한국어'),
];

/**
 * Storage key for saving language preference
 */
export const LANGUAGE_STORAGE_KEY = 'app_language_preference';
