import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../src/shared/hooks';

export const createCommonStyles = () => {
  const theme = useAppTheme();
  
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