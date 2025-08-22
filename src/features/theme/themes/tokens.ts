// Design tokens that remain consistent across all themes

// Global spacing tokens (consistent across all themes)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Platform-specific constants (keep in tokens.ts)
export const platformConstants = {
  // Standard header height (56px + status bar)
  headerHeight: 30,
  
  // Status bar heights for different platforms
  statusBarHeight: {
    ios: 44,
    android: 24,
  },
  
  // Standard screen padding
  screenPadding: {
    horizontal: 16, // spacing.lg
    vertical: 12,   // spacing.md
  },
};
