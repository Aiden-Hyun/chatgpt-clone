import { ILogger } from '../../shared/interfaces/ILogger';
import { Logger } from '../../shared/utils/Logger';
import { IThemeService } from '../interfaces/IThemeService';
import { ThemeService } from '../ThemeService';

// Import themes
import claymorphismTheme from '../../../business/theme/themes/claymorphism';
import defaultTheme from '../../../business/theme/themes/default';
import glassmorphismTheme from '../../../business/theme/themes/glassmorphism';
import gradientNeumorphismTheme from '../../../business/theme/themes/gradient-neumorphism';

/**
 * Initialize themes by registering them with the theme service
 * @param themeService Theme service to register themes with
 * @param logger Logger for logging
 */
export function initializeThemes(
  themeService: IThemeService = new ThemeService(),
  logger: ILogger = new Logger().child('ThemeInitializer')
): void {
  logger.info('Initializing themes...');

  // Register the default theme
  themeService.registerTheme({
    ...defaultTheme,
  });

  // Register the glassmorphism theme
  themeService.registerTheme({
    ...glassmorphismTheme,
  });

  // Register the claymorphism theme
  themeService.registerTheme({
    ...claymorphismTheme,
  });

  // Register the gradient neumorphism theme
  themeService.registerTheme({
    ...gradientNeumorphismTheme,
  });

  logger.info('Themes initialized successfully');
}
