import { StyleSheet } from 'react-native';
import { useAppTheme } from '../src/shared/hooks';

// Note: This file now exports a function that returns styles based on the current theme
// Components should use this function instead of importing styles directly

export const createLoginStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    center: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: theme.spacing.xxl,
      backgroundColor: theme.colors.background.primary
    },
    title: { 
      fontSize: theme.fontSizes.xxl, 
      marginBottom: theme.spacing.xl,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.text.primary
    },
  });
};

// Legacy export for backward compatibility (deprecated)
// Components should use createLoginStyles() instead
export const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32,
    backgroundColor: '#FFFFFF'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20,
    fontWeight: '600',
    color: '#000000'
  },
});
