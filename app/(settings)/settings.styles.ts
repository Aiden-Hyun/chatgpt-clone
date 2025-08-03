import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/shared/hooks';

export const createSettingsStyles = () => {
  const theme = useAppTheme();
  
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
    backButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.bold as '700',
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
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.light,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    settingLabel: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
      flex: 1,
    },
    settingValue: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },
    languageSelector: {
      marginVertical: 0,
    },
    logoutButton: {
      backgroundColor: theme.colors.status.error.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    logoutText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
    },
  });
}; 