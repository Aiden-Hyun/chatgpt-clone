// Theme registry for managing available themes
import { ThemeWithMetadata } from '../../../business/types/theme/theme.types';
import { ILogger } from '../../shared/interfaces/ILogger';
import { Logger } from '../../shared/utils/Logger';

/**
 * Registry of all available themes
 */
export class ThemeRegistry {
  private themes: Map<string, ThemeWithMetadata> = new Map();
  private logger: ILogger;

  constructor(logger: ILogger = new Logger().child('ThemeRegistry')) {
    this.logger = logger;
  }

  /**
   * Register a new theme
   * @param theme Theme with metadata
   */
  register(theme: ThemeWithMetadata): void {
    if (this.themes.has(theme.id)) {
      this.logger.warn(`Theme with ID ${theme.id} is already registered. It will be overwritten.`);
    }
    this.themes.set(theme.id, theme);
    this.logger.debug(`Registered theme: ${theme.id}`);
  }

  /**
   * Get a theme by ID
   * @param id Theme ID
   * @returns Theme with metadata or undefined if not found
   */
  getTheme(id: string): ThemeWithMetadata | undefined {
    return this.themes.get(id);
  }

  /**
   * Get all available themes
   * @returns Array of all registered themes
   */
  getAllThemes(): ThemeWithMetadata[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get all theme IDs
   * @returns Array of all theme IDs
   */
  getAllThemeIds(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Check if a theme exists
   * @param id Theme ID
   * @returns True if theme exists, false otherwise
   */
  hasTheme(id: string): boolean {
    return this.themes.has(id);
  }

  /**
   * Get the default theme
   * @returns Default theme
   */
  getDefaultTheme(): ThemeWithMetadata {
    if (this.themes.size === 0) {
      throw new Error('No themes registered');
    }
    
    // Try to get the default theme, fallback to first theme if not found
    return this.themes.get('default') || this.themes.values().next().value!;
  }
}

// Create and export the singleton instance
export const themeRegistry = new ThemeRegistry();

// Note: Theme registration will be done in a separate initialization file
// to avoid circular dependencies and to allow for lazy loading of themes

export default themeRegistry;