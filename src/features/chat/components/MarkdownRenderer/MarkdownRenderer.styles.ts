import { Platform, StyleSheet } from 'react-native';

export const createMarkdownRendererStyles = (theme: any) => {
  return StyleSheet.create({
    // Body Text
    body: {
      fontSize: 16,
      fontFamily: theme.fontFamily.primary,
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
    
    // Text styling
    text: {
      fontSize: 16,
      color: theme.colors.text.primary,
      lineHeight: 26,
    },
    
    strong: {
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    em: {
      fontStyle: 'italic',
      color: theme.colors.text.secondary,
    },
    
    // Code blocks (fallback if custom renderer fails)
    code_block: {
      fontFamily: Platform.OS === 'web'
        ? "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        : 'CascadiaMono',
      fontSize: 14,
      backgroundColor: theme.colors.syntax.background,
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
      fontFamily: Platform.OS === 'web'
        ? "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        : 'CascadiaMono',
      fontSize: 14,
      backgroundColor: theme.colors.syntax.background,
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
      fontFamily: Platform.OS === 'web'
        ? "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        : 'CascadiaMono',
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

    // Images
    image: {
      width: '100%',
      height: 480,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.background.tertiary,
    },
    image_container: {
      position: 'relative',
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginVertical: theme.spacing.md,
      backgroundColor: theme.colors.background.tertiary,
    },
    image_overlayButton: {
      position: 'absolute',
      right: 8,
      bottom: 8,
      backgroundColor: 'rgba(26, 32, 44, 0.6)',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: theme.borderRadius.lg,
    },
  });
};
