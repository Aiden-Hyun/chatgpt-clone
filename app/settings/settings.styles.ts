import { Platform, StyleSheet } from 'react-native';
import { AppTheme } from '../../src/features/theme/theme.types';

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
      // Android-specific: Add extra padding for status bar
      paddingTop: Platform.OS === 'android' 
        ? theme.spacing.md + 24  // Android status bar height
        : theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      // Android-specific: Increase touch area for better accessibility
      ...(Platform.OS === 'android' && {
        minWidth: 48,
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
      }),
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
