import { Result } from '../../shared/Result';
import { Language } from '../entities/Language';

/**
 * Interface for language repository operations
 */
export interface ILanguageRepository {
  /**
   * Get all translations for a specific language
   * @param languageCode The language code
   * @returns A Result containing the translations or an error
   */
  getTranslations(languageCode: string): Result<Record<string, string>>;
  
  /**
   * Get all supported languages
   * @returns Array of supported Language entities
   */
  getSupportedLanguages(): Language[];
  
  /**
   * Get the current language code from storage
   * @returns A Result containing the language code or an error
   */
  getCurrentLanguage(): Result<string>;
  
  /**
   * Save the current language code to storage
   * @param languageCode The language code to save
   * @returns A Result indicating success or failure
   */
  saveCurrentLanguage(languageCode: string): Promise<Result<void>>;
}
