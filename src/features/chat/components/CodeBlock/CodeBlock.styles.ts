import { StyleSheet } from 'react-native';

export const createCodeBlockStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.syntax?.background || theme.colors.background.tertiary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      marginVertical: theme.spacing.lg,
      overflow: 'hidden',
    },
    
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    
    languageLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 6,
      backgroundColor: theme.colors.interactive.hover.primary,
    },
    
    copyText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
      marginLeft: theme.spacing.xs,
    },
    
    codeContainer: {
      padding: theme.spacing.lg,
    },
    
    lineContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 0,
    },
    
    lineNumbers: {
      paddingRight: theme.spacing.md,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border.light,
      marginRight: theme.spacing.md,
    },
    
    lineNumber: {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      color: theme.colors.text.quaternary,
      textAlign: 'right',
      minWidth: 24,
      marginRight: theme.spacing.md,
      paddingTop: 0,
    },
    
    codeContent: {
      flex: 1,
    },
    
    codeLine: {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    
    code: {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      color: theme.colors.text.primary,
    },
  });
};
