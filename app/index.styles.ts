import { StyleSheet } from 'react-native';

// Note: This file now exports a function that returns styles based on the current theme
// Components should use this function instead of importing styles directly

export const createIndexStyles = (theme: any) => {
  
  return StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: 100, // Add top padding to avoid status bar and settings button
    },
    center: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.xxl
    },
    emptyStateText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xxl,
      textAlign: 'center',
      fontFamily: theme.fontFamily.primary,
      fontStyle: 'italic',
      letterSpacing: theme.letterSpacing.wide
    },
    buttonText: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.button.text,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.wide
    },
    welcomeText: {
      fontSize: theme.fontSizes.xxl,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.wide
    },
    logoutText: {
      color: theme.colors.button.text, 
      fontSize: theme.fontSizes.md, 
      fontFamily: theme.fontFamily.primary, 
      letterSpacing: theme.letterSpacing.wide
    },
    newButton: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.button.primary,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    logoutButton: {
      alignSelf: 'center',
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.button.primary,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    settingsMenuButton: {
      position: 'absolute',
      top: 60,
      right: 16,
      zIndex: 1000,
      padding: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    settingsMenuText: {
      fontSize: 20,
      color: '#333',
      fontWeight: '600',
    },
  });
}; 