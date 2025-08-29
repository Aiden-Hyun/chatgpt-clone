import { ThemeWithMetadata } from '../../../business/types/theme/theme.types';

/**
 * Interface for theme service
 * Provides methods for managing themes
 */
export interface IThemeService {
  /**
   * Register a new theme
   * @param theme Theme with metadata
   */
  registerTheme(theme: ThemeWithMetadata): void;

  /**
   * Get a theme by ID
   * @param id Theme ID
   * @returns Theme with metadata or undefined if not found
   */
  getTheme(id: string): ThemeWithMetadata | undefined;

  /**
   * Get all available themes
   * @returns Array of all registered themes
   */
  getAllThemes(): ThemeWithMetadata[];

  /**
   * Get all theme IDs
   * @returns Array of all theme IDs
   */
  getAllThemeIds(): string[];

  /**
   * Check if a theme exists
   * @param id Theme ID
   * @returns True if theme exists, false otherwise
   */
  hasTheme(id: string): boolean;

  /**
   * Get the default theme
   * @returns Default theme
   */
  getDefaultTheme(): ThemeWithMetadata;
}
