// Main exports for the theme feature

// Export theme registry
export { default as themeRegistry } from './themeRegistry';

// Export ThemeProvider for app initialization
export { ThemeProvider } from './context/ThemeContext';

// Export theme hooks
export { useTheme } from './hooks/useTheme';
export { useThemeStyle } from './hooks/useThemeStyle';

// Export components
export * from './components';
