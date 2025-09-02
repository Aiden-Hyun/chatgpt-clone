import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../src/features/theme/theme.types';

export const createThemeSettingsStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borders.radius.md,
    },
    headerTitle: {
      marginBottom: 0, // Remove margin since Text component handles spacing
    },
    headerSpacer: {
      width: 44, // Same width as back button for centering
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    section: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
    },
    
    // Current Theme Section
    currentThemeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      //padding: theme.spacing.lg,
      justifyContent: 'flex-start',
    },
    currentThemePreview: {
      width: 200,
      height: 100,
      //marginRight: theme.spacing.md,
      //marginLeft: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0, // Prevent preview from shrinking
    },
    // Current theme color palette styles
    currentColorPalette: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      gap: theme.spacing.sm,
    },
    currentColorSwatch: {
      width: 36,
      height: 56,
      borderRadius: theme.borders.radius.xs,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    previewContent: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    previewButton: {
      width: 30,
      height: 12,
      borderRadius: theme.borders.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    previewText: {
      width: 20,
      height: 8,
      borderRadius: theme.borders.radius.xs,
      backgroundColor: theme.colors.text.secondary,
    },
    currentThemeInfo: {
      flex: 1,
      minWidth: 0, // Allow text to wrap
      width: '100%',
    },
    currentThemeName: {
      marginBottom: theme.spacing.md,
    },
    currentThemeDescription: {
      marginBottom: theme.spacing.lg,
      flex: 1,
      flexShrink: 1,
      minWidth: 0, // Allow text to wrap
      width: '50%',
    },
    currentModeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borders.radius.round,
      marginTop: theme.spacing.sm,
    },
    currentModeText: {
      color: theme.colors.text.inverted,
    },
    
    // Theme Selection Section
    themeGrid: {
      flexDirection: 'column',
      gap: theme.spacing.md,
    },
    themeCard: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderRadius: theme.borders.radius.lg,
      borderWidth: theme.borders.widths.thin,
      borderColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.secondary,
      minHeight: 80, // Reduced height since we're using horizontal layout
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      borderWidth: theme.borders.widths.medium,
      backgroundColor: theme.colors.interactive.hover.primary,
    },
    themePreview: {
      marginRight: theme.spacing.md,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      width: 120, // Fixed width for color palette
    },
    // Color palette styles
    colorPalette: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.sm,
    },
    colorSwatch: {
      width: 20,
      height: 24,
      borderRadius: theme.borders.radius.xs,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    previewElements: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    previewCard: {
      width: 40,
      height: 20,
      borderRadius: theme.borders.radius.sm,
    },
    themeName: {
      flex: 1,
      textAlign: 'left',
    },
    selectedIndicator: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
    },
    
    // Appearance Mode Section
    modeSelector: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    modeButton: {
      flex: 1,
    },
    modeButtonSelected: {
      // Button component handles selected state
    },
  });
};

export default createThemeSettingsStyles;
