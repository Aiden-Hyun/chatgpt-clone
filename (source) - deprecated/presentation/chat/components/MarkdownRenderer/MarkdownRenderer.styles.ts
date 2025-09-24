import { Platform, StyleSheet } from 'react-native';

import { PresentationTheme } from '../../../interfaces/theme';

export const createMarkdownRendererStyles = (theme: PresentationTheme, isMobile: boolean = false) => {
  return StyleSheet.create({
    // Body Text
    body: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      lineHeight: 20,
      marginBottom: 0,
      fontWeight: '400',
    },
    
    // Paragraphs
    paragraph: {
      fontSize: 16,
      color: theme.colors.text.primary,
      lineHeight: 20,
      marginBottom: 0,
      fontWeight: '400',
    },
    
    // Typography Hierarchy
    heading1: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      lineHeight: 26,
      letterSpacing: -0.5,
    },
    heading2: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      lineHeight: 26,
      letterSpacing: -0.3,
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      lineHeight: 23,
      letterSpacing: -0.2,
    },
    heading4: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      lineHeight: 21,
    },
    heading5: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      lineHeight: 20,
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
      borderColor: theme.borders.colors.light,
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
      borderColor: theme.borders.colors.light,
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
      borderColor: theme.borders.colors.light,
    },
    
    // Lists - Modern Styling
    bullet_list: {
      marginVertical: theme.spacing.md,
    },
    ordered_list: {
      marginVertical: theme.spacing.md,
    },
    list_item: {
      fontSize: 14,
      color: theme.colors.text.primary,
      lineHeight: 20,
      //marginBottom: theme.spacing.sm,
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

    // Tables - Clean Modern Look with Responsive Support
    table: {
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
      borderRadius: 8,
      marginVertical: theme.spacing.lg,
      overflow: 'hidden',
      // On mobile, ensure table can be scrolled horizontally
      ...(isMobile && {
        minWidth: 0, // Ensure table is wide enough to trigger horizontal scroll
      }),
    },
    thead: {
      backgroundColor: theme.colors.background.secondary,
    },
    tbody: {
      backgroundColor: theme.colors.background.primary,
    },
    tr: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
      maxHeight: 130,
    },
    scrollContainer: {
      width: "100%",
    },
    th: {
      flex: 0,        // Don't use flex: 1 (which makes all columns equal)
      flexGrow: 0.5,    // Allow growing based on content
      flexShrink: 0.5,  // Allow shrinking
      flexBasis: '0%',
      padding: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      fontWeight: '600',
      fontSize: 14,
      color: theme.colors.text.secondary,
      borderRightWidth: 1,
      borderRightColor: theme.borders.colors.light,
      minWidth: 0,
      // On mobile, prevent text wrapping and ensure minimum width
      ...(isMobile && {
        minWidth: 0,
      }),
    },
    td: {
      flex: 0,        // Don't use flex: 1 (which makes all columns equal)
      flexGrow: 0.5,    // Allow growing based on content
      flexShrink: 0.5,  // Allow shrinking
      padding: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      fontSize: 14,
      color: theme.colors.text.primary,
      borderRightWidth: 1,
      borderRightColor: theme.borders.colors.light,
      maxWidth: 250,
      minWidth: 0,
      // On mobile, prevent text wrapping and ensure minimum width
      ...(isMobile && {
        minWidth: 0,
      }),
    },
    cellScrollView: {
      maxHeight: 130, // Limit cell height and enable scrolling
    },
    scrollBar: {
      backgroundColor: theme.colors.background.secondary,
    },
    
    
    // Links - Styled Like ChatGPT
    link: {
      textDecorationLine: 'none',
      fontWeight: '600',
      fontSize: 8,
      color: theme.colors.status.info.primary, 
    },
    
    // Horizontal Rules
    hr: {
      backgroundColor: theme.borders.colors.light,
      height: 1,
      marginVertical: theme.spacing.xl,
      borderWidth: 0,
    },

    // Images
    image: {
      width: '100%',
      height: 480,
      borderRadius: theme.borders.radius.lg,
      backgroundColor: theme.colors.background.tertiary,
    },
    image_container: {
      position: 'relative',
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: theme.borders.radius.lg,
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
      borderRadius: theme.borders.radius.lg,
    },
  });
};
