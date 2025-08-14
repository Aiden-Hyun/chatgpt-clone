import { StyleSheet } from 'react-native';

export const createAssistantMessageStyles = (theme: any) => {
  
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    compact: {
      marginVertical: theme.spacing.xxs,
    },
    text: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 28,
      textAlign: 'left',
      fontWeight: theme.fontWeights.normal as '400',
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    cursor: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.normal as '400',
    },
    // Markdown styles
    heading1: {
      fontSize: theme.fontSizes.xxl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.sm,
    },
    heading2: {
      fontSize: theme.fontSizes.xl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    code_block: {
      fontFamily: 'monospace',
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    fence: {
      fontFamily: 'monospace',
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.text.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    strong: {
      fontWeight: 'bold',
    },
    body: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      lineHeight: 24,
    },
  });
}; 