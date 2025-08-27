import { Result } from '../../shared/Result';
import { Language } from '../entities/Language';

/**
 * Interface for language service operations
 */
export interface ILanguageService {
  /**
   * Get a translation for a given key
   * @param key The translation key
   * @returns The translated string or the key itself if not found
   */
  translate(key: string): string;
  
  /**
   * Get the current language code
   * @returns The current language code (e.g., 'en', 'es', 'ko')
   */
  getCurrentLanguage(): string;
  
  /**
   * Set the current language
   * @param languageCode The language code to set
   * @returns A Result indicating success or failure
   */
  setLanguage(languageCode: string): Result<void>;
  
  /**
   * Get all supported languages
   * @returns Array of supported Language entities
   */
  getSupportedLanguages(): Language[];
  
  /**
   * Format a translation with variables
   * @param key The translation key
   * @param variables Object containing variables to replace in the translation
   * @returns The formatted translation string
   */
  formatTranslation(key: string, variables: Record<string, string>): string;
}
