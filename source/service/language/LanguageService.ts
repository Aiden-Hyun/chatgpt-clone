import { DEFAULT_LANGUAGE } from '../../business/language/constants';
import { Language } from '../../business/language/entities';
import { ILanguageRepository, ILanguageService } from '../../business/language/interfaces';
import { Result } from '../../business/shared/types/Result';
import { ILogger } from '../shared/interfaces/ILogger';
import { formatTranslation } from './utils/languageFormatter';

/**
 * Implementation of the ILanguageService interface
 */
export class LanguageService implements ILanguageService {
  private readonly languageRepository: ILanguageRepository;
  private readonly logger: ILogger;
  private currentLanguageCode: string = DEFAULT_LANGUAGE;
  
  constructor(languageRepository: ILanguageRepository, logger: ILogger) {
    this.languageRepository = languageRepository;
    this.logger = logger;
    
    // Initialize with the stored language or default
    this.initializeLanguage();
  }
  
  /**
   * Initialize the language service with the stored language preference
   */
  private async initializeLanguage(): Promise<void> {
    const result = this.languageRepository.getCurrentLanguage();
    
    if (result.isSuccess() && result.getValue()) {
      this.currentLanguageCode = result.getValue();
      this.logger.info('LanguageService initialized with stored language', { language: this.currentLanguageCode });
    } else {
      this.currentLanguageCode = DEFAULT_LANGUAGE;
      this.logger.info('LanguageService initialized with default language', { language: this.currentLanguageCode });
    }
  }
  
  /**
   * Get a translation for a given key
   * @param key The translation key
   * @returns The translated string or the key itself if not found
   */
  public translate(key: string): string {
    const translationsResult = this.languageRepository.getTranslations(this.currentLanguageCode);
    
    if (translationsResult.isSuccess()) {
      const translations = translationsResult.getValue();
      const translation = translations[key];
      
      if (translation) {
        return translation;
      }
      
      // If translation not found in current language, try English as fallback
      if (this.currentLanguageCode !== DEFAULT_LANGUAGE) {
        const fallbackResult = this.languageRepository.getTranslations(DEFAULT_LANGUAGE);
        if (fallbackResult.isSuccess()) {
          const fallbackTranslations = fallbackResult.getValue();
          const fallbackTranslation = fallbackTranslations[key];
          
          if (fallbackTranslation) {
            return fallbackTranslation;
          }
        }
      }
    }
    
    // Return the key itself if no translation found
    return key;
  }
  
  /**
   * Get the current language code
   * @returns The current language code (e.g., 'en', 'es', 'ko')
   */
  public getCurrentLanguage(): string {
    return this.currentLanguageCode;
  }
  
  /**
   * Set the current language
   * @param languageCode The language code to set
   * @returns A Result indicating success or failure
   */
  public setLanguage(languageCode: string): Result<void> {
    // Check if the language is supported
    const supportedLanguages = this.languageRepository.getSupportedLanguages();
    const isSupported = supportedLanguages.some(lang => lang.getCode() === languageCode);
    
    if (!isSupported) {
      this.logger.error('Attempted to set unsupported language', { language: languageCode });
      return Result.failure(`Language '${languageCode}' is not supported`);
    }
    
    // Update the current language
    this.currentLanguageCode = languageCode;
    
    // Save the language preference
    this.languageRepository.saveCurrentLanguage(languageCode)
      .then(result => {
        if (result.isFailure()) {
          this.logger.error('Failed to save language preference', { language: languageCode, error: result.getError() });
        }
      })
      .catch(error => {
        this.logger.error('Error saving language preference', { language: languageCode, error });
      });
    
    this.logger.info('Language changed', { language: languageCode });
    return Result.success(undefined);
  }
  
  /**
   * Get all supported languages
   * @returns Array of supported Language entities
   */
  public getSupportedLanguages(): Language[] {
    return this.languageRepository.getSupportedLanguages();
  }
  
  /**
   * Format a translation with variables
   * @param key The translation key
   * @param variables Object containing variables to replace in the translation
   * @returns The formatted translation string
   */
  public formatTranslation(key: string, variables: Record<string, string>): string {
    const translation = this.translate(key);
    return formatTranslation(translation, variables);
  }
}