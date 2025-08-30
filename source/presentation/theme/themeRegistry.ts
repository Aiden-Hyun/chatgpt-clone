// Theme registry for managing available themes
import { ThemeWithMetadata } from '../interfaces/theme';

import claymorphismTheme from './themes/claymorphism';
import defaultTheme from './themes/default';
import glassmorphismTheme from './themes/glassmorphism';
import gradientNeumorphismTheme from './themes/gradient-neumorphism';

/**
 * Registry of all available themes
 */
class ThemeRegistry {
  private themes: Map<string, ThemeWithMetadata> = new Map();

  /**
   * Register a new theme
   * @param theme Theme with metadata
   */
  register(theme: ThemeWithMetadata): void {
    if (this.themes.has(theme.id)) {
      console.warn(`Theme with ID ${theme.id} is already registered. It will be overwritten.`);
    }
    this.themes.set(theme.id, theme);
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

// Register the default theme
themeRegistry.register({
  ...defaultTheme,
});

// Register the glassmorphism theme
themeRegistry.register({
  ...glassmorphismTheme,
});

// Register the claymorphism theme
themeRegistry.register({
  ...claymorphismTheme,
});

// Register the gradient neumorphism theme
themeRegistry.register({
  ...gradientNeumorphismTheme,
});

export default themeRegistry;
