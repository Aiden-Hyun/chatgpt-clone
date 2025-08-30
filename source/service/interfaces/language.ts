// Language service interfaces
export interface ILanguageRepository {
  getCurrentLanguage(): string;
  getTranslations(languageCode: string): Record<string, string>;
  getSupportedLanguages(): string[];
  saveLanguage(languageCode: string): void;
}

export interface ILanguageService {
  translate(key: string): string;
  getCurrentLanguage(): string;
  setLanguage(languageCode: string): void;
  getSupportedLanguages(): string[];
}

