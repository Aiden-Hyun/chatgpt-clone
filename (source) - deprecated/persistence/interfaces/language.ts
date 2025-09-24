// Language-related interfaces and types for persistence layer

// Language repository interface
export interface ILanguageRepository {
  getCurrentLanguage(): Promise<{ success: boolean; language?: Language; error?: string }>;
  setLanguage(language: Language): Promise<{ success: boolean; error?: string }>;
  getSupportedLanguages(): Promise<{ success: boolean; languages?: Language[]; error?: string }>;
  getDefaultLanguage(): Promise<{ success: boolean; language?: Language; error?: string }>;
}

// Language entity
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

// Language constants
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'app_language';
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', isRTL: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
];
