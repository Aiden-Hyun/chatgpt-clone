import { StyleSheet } from 'react-native';
// import { getButtonSize } from '../../../../shared/utils/layout';
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
      width: theme.layout.buttonSizes.icon,
      height: theme.layout.buttonSizes.icon,
      paddingVertical: 0,
      paddingHorizontal: 0,
      minHeight: theme.layout.buttonSizes.icon,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      borderRadius: theme.layout.buttonSizes.icon / 2,
      backgroundColor: 'transparent',
    },
    iconText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.secondary,
    },
    scrollIndicator: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    scrollIcon: {
      fontSize: theme.typography.fontSizes.xl,
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.fontWeights.regular as '400',
    },
  });
}; 