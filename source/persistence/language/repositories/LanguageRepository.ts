import { translations } from '../../../service/language/translations';
import { DEFAULT_LANGUAGE, ILanguageRepository, Language, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '../../interfaces/language';
import { ILogger, IStorageAdapter, Result } from '../../interfaces/shared';

/**
 * Implementation of the ILanguageRepository interface
 */
export class LanguageRepository implements ILanguageRepository {
  private readonly storageAdapter: IStorageAdapter;
  private readonly logger: ILogger;
  
  constructor(storageAdapter: IStorageAdapter, logger: ILogger) {
    this.storageAdapter = storageAdapter;
    this.logger = logger;
  }
  
  /**
   * Get all translations for a specific language
   * @param languageCode The language code
   * @returns A Result containing the translations or an error
   */
  public getTranslations(languageCode: string): Result<Record<string, string>> {
    try {
      const languageTranslations = translations[languageCode];
      
      if (!languageTranslations) {
        this.logger.warn('Translations not found for language', { language: languageCode });
        return createFailure(`Translations not found for language '${languageCode}'`);
      }
      
      return createSuccess(languageTranslations);
    } catch (error) {
      this.logger.error('Error getting translations', { language: languageCode, error });
      return createFailure('Failed to get translations');
    }
  }
  
  /**
   * Get all supported languages
   * @returns Array of supported Language entities
   */
  public getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }
  
  /**
   * Get the current language code from storage
   * @returns A Result containing the language code or an error
   */
  public getCurrentLanguage(): Result<string> {
    try {
      // This is a synchronous method, but AsyncStorage is async
      // We return the default language and let the service handle the async loading
      return createSuccess(DEFAULT_LANGUAGE);
    } catch (error) {
      this.logger.error('Error getting current language', { error });
      return createFailure('Failed to get current language');
    }
  }
  
  /**
   * Save the current language code to storage
   * @param languageCode The language code to save
   * @returns A Result indicating success or failure
   */
  public async saveCurrentLanguage(languageCode: string): Promise<Result<void>> {
    try {
      const result = await this.storageAdapter.setValue(LANGUAGE_STORAGE_KEY, languageCode);
      
      if (isFailure(result)) {
        this.logger.error('Failed to save language preference', { language: languageCode, error: result.error });
        return createFailure(result.error);
      }
      
      return createSuccess(undefined);
    } catch (error) {
      this.logger.error('Error saving language preference', { language: languageCode, error });
      return createFailure('Failed to save language preference');
    }
  }
}