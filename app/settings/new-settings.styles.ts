import { StyleSheet } from 'react-native';
import { AppTheme } from '../../src/features/theme/theme.types';

export const createNewSettingsStyles = (theme: AppTheme) => {
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
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    headerSpacer: {
      width: 44, // Same width as back button for centering
    },
    scrollView: {
      flex: 1,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background.avatar,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      fontSize: 36,
      color: theme.colors.text.inverted,
    },
    userName: {
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border.light,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      marginBottom: theme.spacing.xxxl,
      marginTop: theme.spacing.md,
    },
    logoutText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
    },
  });
};

export default createNewSettingsStyles;
