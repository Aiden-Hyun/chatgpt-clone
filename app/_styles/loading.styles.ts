import { StyleSheet } from 'react-native';

export const createLoadingStyles = (theme: any) => {
  
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.lg,
      fontFamily: theme.fontFamily.primary,
    },
  });
};

export default createLoadingStyles; 