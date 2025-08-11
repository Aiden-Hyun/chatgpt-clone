import { StyleSheet } from 'react-native';

export const createCommonStyles = (theme: any) => {
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.xxl,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
  });
};

export default createCommonStyles; 