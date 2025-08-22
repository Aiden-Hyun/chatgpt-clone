import { StyleSheet } from 'react-native';
import { AppTheme } from '../../../features/theme/theme.types';

/**
 * Creates dropdown styles based on the current theme
 */
export const createDropdownStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    trigger: {
      minHeight: 44,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.md,
    },
    triggerText: {
      flex: 1,
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeights.medium as '500',
    },
    chevron: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      opacity: 0.6,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
    menu: {
      position: 'absolute' as const,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borders.radius.lg,
      paddingVertical: theme.spacing.xs,
      shadowColor: theme.colors.text.primary,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    list: {
      maxHeight: 280,
    },
    item: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    itemText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeights.medium as '500',
    },
    itemSelected: {
      backgroundColor: theme.colors.primary + '08',
    },
    itemTextSelected: {
      fontWeight: theme.typography.fontWeights.semibold as '600',
      color: theme.colors.primary,
    },
    itemDisabled: {
      opacity: 0.4,
    },
    itemTextDisabled: {
      color: theme.colors.text.tertiary,
    },
  });
};

export default createDropdownStyles;
