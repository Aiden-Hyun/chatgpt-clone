import { Platform, StyleSheet } from 'react-native';
import { AppTheme } from '../../../theme/theme.types';

export const createAssistantMessageStyles = (theme: AppTheme) => {
  
  const webMonoStack = "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
  const codeFont = Platform.OS === 'web' ? webMonoStack : 'CascadiaMono';

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
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 24,
      textAlign: 'left',
      fontWeight: theme.typography.fontWeights.regular as '400',
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    cursor: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.regular as '400',
    },
    
    // ✨ MODERN CHATGPT-LIKE MARKDOWN STYLES ✨
    
    // Typography Hierarchy
    heading1: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    heading4: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      lineHeight: 26,
    },
    heading5: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      lineHeight: 24,
    },
    heading6: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      lineHeight: 20,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    
    // Body Text
    body: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 26,
      marginBottom: theme.spacing.md,
      fontWeight: '400',
    },
    
    // Paragraphs
    paragraph: {
      fontSize: 16,
      color: theme.colors.text.primary,
      lineHeight: 26,
      marginBottom: theme.spacing.lg,
      fontWeight: '400',
    },
    
    // Text Styling
    strong: {
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    em: {
      fontStyle: 'italic',
      color: theme.colors.text.secondary,
    },
    
    // Code Blocks - Modern ChatGPT Style
    code_block: {
      fontFamily: codeFont as any,
      fontSize: 14,
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
      padding: theme.spacing.lg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      marginVertical: theme.spacing.lg,
      lineHeight: 22,
      overflow: 'hidden',
    },
    fence: {
      fontFamily: codeFont as any,
      fontSize: 14,
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
      padding: theme.spacing.lg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      marginVertical: theme.spacing.lg,
      lineHeight: 22,
      overflow: 'hidden',
    },
    
    // Inline Code
    code_inline: {
      fontFamily: codeFont as any,
      fontSize: 14,
      backgroundColor: theme.colors.background.secondary,
      color: theme.colors.status.info.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    
    // Lists - Modern Styling
    bullet_list: {
      marginVertical: theme.spacing.md,
    },
    ordered_list: {
      marginVertical: theme.spacing.md,
    },
    list_item: {
      fontSize: 16,
      color: theme.colors.text.primary,
      lineHeight: 26,
      marginBottom: theme.spacing.sm,
      paddingLeft: theme.spacing.md,
    },
    bullet_list_icon: {
      color: theme.colors.status.info.primary,
      fontWeight: '600',
      fontSize: 12,
      marginRight: theme.spacing.sm,
    },
    
    // Blockquotes - Elegant Style
    blockquote: {
      backgroundColor: theme.colors.background.secondary,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.status.info.primary,
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginVertical: theme.spacing.lg,
      borderRadius: 8,
      fontStyle: 'italic',
    },
    
    // Tables - Clean Modern Look
    table: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: 8,
      marginVertical: theme.spacing.lg,
      overflow: 'hidden',
    },
    thead: {
      backgroundColor: theme.colors.background.secondary,
    },
    tbody: {
      backgroundColor: theme.colors.background.primary,
    },
    th: {
      padding: theme.spacing.md,
      fontWeight: '600',
      fontSize: 14,
      color: theme.colors.text.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    td: {
      padding: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.text.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    
    // Links - Styled Like ChatGPT
    link: {
      color: theme.colors.status.info.primary,
      textDecorationLine: 'underline',
      fontWeight: '500',
    },
    
    // Horizontal Rules
    hr: {
      backgroundColor: theme.colors.border.light,
      height: 1,
      marginVertical: theme.spacing.xl,
      borderWidth: 0,
    },
    
    // Math/Latex (if supported)
    math: {
      fontSize: 16,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing.sm,
      borderRadius: 6,
      fontFamily: 'serif',
    },
  });
}; 