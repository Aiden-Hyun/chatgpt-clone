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
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
    },
    
    // Current Theme Section
    currentThemeCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currentThemePreview: {
      width: 80,
      height: 80,
      borderRadius: theme.borders.radius.md,
      backgroundColor: theme.colors.background.primary,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
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
    },
    currentThemeName: {
      marginBottom: theme.spacing.xs,
    },
    currentThemeDescription: {
      marginBottom: theme.spacing.sm,
    },
    currentModeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borders.radius.round,
    },
    currentModeText: {
      color: theme.colors.text.inverted,
    },
    
    // Theme Selection Section
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    themeCard: {
      width: '48%',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borders.radius.lg,
      borderWidth: theme.borders.widths.thin,
      borderColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.secondary,
      minHeight: 120,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.interactive.hover.primary,
    },
    themePreview: {
      marginBottom: theme.spacing.sm,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
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
      textAlign: 'center',
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
