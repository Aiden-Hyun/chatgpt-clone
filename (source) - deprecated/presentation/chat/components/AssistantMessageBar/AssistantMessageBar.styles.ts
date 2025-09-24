import { StyleSheet } from 'react-native';

// import { getButtonSize } from '../../../../shared/utils/layout';
import { PresentationTheme } from '../../../interfaces/theme';

export const createAssistantMessageBarStyles = (theme: PresentationTheme) => {
  
  return StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
      marginBottom: 0,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 0,
    },
    iconButton: {
      width: 28,
      height: 28,
      paddingVertical: 0,
      paddingHorizontal: 0,
      minHeight: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      borderRadius: 14,
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