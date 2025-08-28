import { Platform, StyleSheet } from 'react-native';
import { PresentationTheme } from '../../theme/types/PresentationTheme';

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  default: 'monospace',
});
const tabularNums = Platform.OS === 'ios' ? (['tabular-nums'] as any) : undefined;
const codeFontNative = 'CascadiaMono';

export const createCodeBlockStyles = (theme: PresentationTheme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.syntax?.background || theme.colors.background.tertiary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
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
      borderBottomColor: theme.borders.colors.light,
      
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
      //marginBottom: 0,
      height: 22,
    },
    
    lineNumbers: {
      paddingRight: theme.spacing.md,
      borderRightWidth: 1,
      borderRightColor: theme.borders.colors.light,
      backgroundColor: theme.colors.background.secondary,
      minWidth: 40,
      alignItems: 'flex-end',
    },
    
    lineNumber: {
      fontSize: 12,
      color: theme.colors.text.tertiary,
      fontFamily: Platform.OS === 'web' ? (monoFont as any) : (codeFontNative as any),
      fontVariant: tabularNums,
      lineHeight: 22,
      textAlign: 'right',
      paddingHorizontal: theme.spacing.xs,
    },
    
    codeContent: {
      flex: 1,
      paddingLeft: theme.spacing.md,
    },
    
    codeLine: {
      fontSize: 14,
      fontFamily: Platform.OS === 'web' ? (monoFont as any) : (codeFontNative as any),
      lineHeight: 22,
      color: theme.colors.text.primary,
    },
  });
};
