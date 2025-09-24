import { enTranslations } from './en';
import { esTranslations } from './es';
import { koTranslations } from './ko';

/**
 * All translations organized by language code
 */
export const translations: Record<string, Record<string, string>> = {
  en: enTranslations,
  es: esTranslations,
  ko: koTranslations,
};

export { enTranslations, esTranslations, koTranslations };
