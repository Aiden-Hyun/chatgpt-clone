import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/shared/hooks';

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
    }
  });
};

// Legacy export for backward compatibility (deprecated)
// Components should use createIndexStyles() instead
export const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32
  },
  emptyStateText: {
    fontSize: 20,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 16,
    textAlign: 'center',
  },
  logoutText: {
    color: '#FFFFFF', 
    fontSize: 16, 
  },
  newButton: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#000000',
    borderRadius: 18,
  },
  logoutButton: {
    alignSelf: 'center',
    margin: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 18,
  }
});
