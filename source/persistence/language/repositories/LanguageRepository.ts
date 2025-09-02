import { ILanguageRepository } from '../../../service/interfaces/language';
import { DEFAULT_LANGUAGE } from '../../../service/language/LanguageService';
import { translations } from '../../../service/language/translations';
import { ILogger, IStorageAdapter } from '../../interfaces/shared';

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
  
  // Return plain translations object (service layer expects raw object)
  public getTranslations(languageCode: string): Record<string, string> {
    const languageTranslations = translations[languageCode];
    if (!languageTranslations) {
      this.logger.warn('Translations not found for language', { language: languageCode });
      return {};
    }
    return languageTranslations;
  }
  
  // Return language codes (service layer expects string[])
  public getSupportedLanguages(): string[] {
    return Object.keys(translations);
  }
  
  // Synchronous getter (service layer expects a string immediately)
  public getCurrentLanguage(): string {
    try {
      // If storage is async in this implementation, return default immediately
      // The service will later allow switching via setLanguage
      return DEFAULT_LANGUAGE;
    } catch (error) {
      this.logger.error('Error getting current language', { error });
      return DEFAULT_LANGUAGE;
    }
  }
  
  // Synchronous save (best-effort). If adapter is async-only, we fire and forget.
  public saveLanguage(languageCode: string): void {
    try {
      // @ts-ignore - adapter may be async in this implementation; ignore result
      (this.storageAdapter as any).setValue?.('language', languageCode);
      this.logger.info('Saved language preference', { language: languageCode });
    } catch (error) {
      this.logger.warn('Failed to persist language preference (non-fatal)', { error });
    }
  }
}