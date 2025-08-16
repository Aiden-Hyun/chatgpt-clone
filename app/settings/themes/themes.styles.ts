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
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    headerTitle: {
      fontSize: theme.fontSizes.xl,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
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
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.fontFamily.primary,
    },
    
    // Current Theme Section
    currentThemeCard: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.light,
    },
    currentThemePreview: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.md,
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
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary,
    },
    previewText: {
      width: 20,
      height: 8,
      borderRadius: theme.borderRadius.xs,
      backgroundColor: theme.colors.text.secondary,
    },
    currentThemeInfo: {
      flex: 1,
    },
    currentThemeName: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.fontFamily.primary,
    },
    currentThemeDescription: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.fontFamily.primary,
    },
    currentModeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    currentModeText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.inverted,
      fontFamily: theme.fontFamily.primary,
    },

    // Theme Grid Section
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: -theme.spacing.xs,
    },
    themeCard: {
      width: '48%',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
      ...theme.shadows.light,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      ...theme.shadows.medium,
    },
    themePreview: {
      height: 120,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background.primary,
      marginBottom: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    previewElements: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    previewCard: {
      width: 40,
      height: 20,
      borderRadius: theme.borderRadius.sm,
    },
    themeName: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontFamily: theme.fontFamily.primary,
    },
    selectedIndicator: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.full,
    },

    // Mode Selector Section
    modeSelector: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      ...theme.shadows.light,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginHorizontal: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    modeButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    modeText: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    modeTextSelected: {
      color: theme.colors.text.inverted,
    },
  });
};

export default createThemeSettingsStyles;
