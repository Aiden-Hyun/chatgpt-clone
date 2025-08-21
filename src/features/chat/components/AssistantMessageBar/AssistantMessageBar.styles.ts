import { StyleSheet } from 'react-native';
import { getButtonSize } from '../../../../shared/utils/layout';
import { AppTheme } from '../../../theme/theme.types';

export const createAssistantMessageBarStyles = (theme: AppTheme) => {
  
  return StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    iconButton: {
      width: getButtonSize('icon'),
      height: getButtonSize('icon'),
      paddingVertical: 0,
      paddingHorizontal: 0,
      minHeight: getButtonSize('icon'),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      borderRadius: getButtonSize('icon') / 2,
      backgroundColor: 'transparent',
    },
    iconText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
    },
    scrollIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    scrollIcon: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.tertiary,
      fontWeight: theme.fontWeights.regular as '400',
    },
  });
}; 