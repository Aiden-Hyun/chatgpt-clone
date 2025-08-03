import { StyleSheet } from 'react-native';
import { useAppTheme } from '../src/shared/hooks';

// Note: This file now exports a function that returns styles based on the current theme
// Components should use this function instead of importing styles directly

export const createIndexStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: theme.colors.background.primary
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
      marginVertical: theme.spacing.lg,
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
      margin: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.button.primary,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    logoutButton: {
      alignSelf: 'center',
      margin: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.button.primary,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.medium
    },
    settingsMenuButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 1000,
      padding: 10,
    },
    settingsMenuText: {
      fontSize: 24,
      color: '#333',
    },
  });
}; 