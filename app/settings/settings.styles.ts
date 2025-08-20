import { StyleSheet } from 'react-native';
import { AppTheme } from '../../src/features/theme/theme.types';
import { getButtonSize } from '../../src/shared/utils/layout';

export const createSettingsStyles = (theme: AppTheme) => {
  
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
      // Use consistent button size for all platforms
      minWidth: getButtonSize('action'),
      minHeight: getButtonSize('action'),
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      marginBottom: 0, // Remove margin since Text component handles spacing
    },
    headerSpacer: {
      width: getButtonSize('header'), // Use consistent button size for centering
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    contentContainer: {
      paddingBottom: theme.spacing.xxl,
      minHeight: '100%',
    },
    section: {
      marginTop: theme.spacing.xl,
    },
    sectionTitle: {
      marginBottom: theme.spacing.md,
    },
    card: {
      // Card component handles its own styling
    },
    editContainer: {
      flexDirection: 'column',
      gap: theme.spacing.md,
    },
    editButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    saveButton: {
      flex: 1,
    },
    cancelButton: {
      flex: 1,
    },
    languageSelector: {
      marginVertical: 0,
    },
    logoutButton: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xxl,
    },
  });
};

export default createSettingsStyles;
