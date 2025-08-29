import { ThemeWithMetadata } from '../../business/types/theme/theme.types';
import { ILogger } from '../shared/interfaces/ILogger';
import { Logger } from '../shared/utils/Logger';

import { IThemeService } from './interfaces/IThemeService';
import { ThemeRegistry } from './utils/themeRegistry';

/**
 * Theme service implementation
 * Provides methods for managing themes
 */
export class ThemeService implements IThemeService {
  private themeRegistry: ThemeRegistry;
  private logger: ILogger;

  constructor(
    themeRegistry: ThemeRegistry = new ThemeRegistry(),
    logger: ILogger = new Logger().child('ThemeService')
  ) {
    this.themeRegistry = themeRegistry;
    this.logger = logger;
  }

  /**
   * Register a new theme
   * @param theme Theme with metadata
   */
  registerTheme(theme: ThemeWithMetadata): void {
    this.themeRegistry.register(theme);
  }

  /**
   * Get a theme by ID
   * @param id Theme ID
   * @returns Theme with metadata or undefined if not found
   */
  getTheme(id: string): ThemeWithMetadata | undefined {
    return this.themeRegistry.getTheme(id);
  }

  /**
   * Get all available themes
   * @returns Array of all registered themes
   */
  getAllThemes(): ThemeWithMetadata[] {
    return this.themeRegistry.getAllThemes();
  }

  /**
   * Get all theme IDs
   * @returns Array of all theme IDs
   */
  getAllThemeIds(): string[] {
    return this.themeRegistry.getAllThemeIds();
  }

  /**
   * Check if a theme exists
   * @param id Theme ID
   * @returns True if theme exists, false otherwise
   */
  hasTheme(id: string): boolean {
    return this.themeRegistry.hasTheme(id);
  }

  /**
   * Get the default theme
   * @returns Default theme
   */
  getDefaultTheme(): ThemeWithMetadata {
    return this.themeRegistry.getDefaultTheme();
  }
}
