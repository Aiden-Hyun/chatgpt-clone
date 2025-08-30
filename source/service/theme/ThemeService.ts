import { ILogger } from '../interfaces';
import { Logger } from '../shared/utils/Logger';

import { IThemeService } from '../interfaces';

/**
 * Theme service implementation
 * Provides methods for managing themes
 */
export class ThemeService implements IThemeService {
  private currentTheme: string = 'default';
  private availableThemes: string[] = ['default', 'dark', 'light'];
  private logger: ILogger;

  constructor(logger: ILogger = new Logger().child('ThemeService')) {
    this.logger = logger;
  }

  /**
   * Get the current theme
   * @returns Promise resolving to the current theme name
   */
  async getCurrentTheme(): Promise<string> {
    return this.currentTheme;
  }

  /**
   * Set the current theme
   * @param themeName The name of the theme to set
   */
  async setTheme(themeName: string): Promise<void> {
    if (this.availableThemes.includes(themeName)) {
      this.currentTheme = themeName;
      this.logger.info('Theme changed', { theme: themeName });
    } else {
      this.logger.warn('Attempted to set unknown theme', { theme: themeName });
    }
  }

  /**
   * Get all available themes
   * @returns Promise resolving to array of available theme names
   */
  async getAvailableThemes(): Promise<string[]> {
    return [...this.availableThemes];
  }

  /**
   * Initialize themes
   */
  async initializeThemes(): Promise<void> {
    this.logger.info('Themes initialized', { themes: this.availableThemes });
  }
}
