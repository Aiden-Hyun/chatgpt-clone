import { StyleSheet } from 'react-native';

import { PresentationTheme } from '../../../interfaces/theme';

export const createModelSelectorStyles = (theme: PresentationTheme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borders.radius.md,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    buttonText: {
      fontSize: 14,
      color: theme.colors.text.primary,
      marginRight: theme.spacing.sm,
    },
    modalContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borders.radius.lg,
      padding: theme.spacing.lg,
      maxWidth: 400,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    modelList: {
      flex: 1,
    },
    modelItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borders.radius.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    modelItemSelected: {
      backgroundColor: theme.colors.interactive.hover.primary,
      borderColor: theme.colors.primary,
    },
    modelLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    modelDescription: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    modelProvider: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
    },
    capabilities: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    capability: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borders.radius.sm,
      backgroundColor: theme.colors.background.tertiary,
    },
    capabilityText: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
    },
  });
};
