import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

/**
 * ChatMessageBubble Styles
 * Dedicated style file for ChatMessageBubble component
 */
export const createChatMessageBubbleStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      width: '100%',
    },
    messageRowCompact: {
      marginVertical: theme.spacing.xxs,
    },
    userMessageRow: {
      justifyContent: 'flex-end',
    },
    assistantMessageRow: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      maxWidth: '70%',
      minWidth: 40,
      ...theme.shadows.light,
    },
    // Clean Article Layout - Full width for AI responses
    assistantMessageBubble: {
      padding: 0, // No padding for full-width article look
      borderRadius: 0, // No border radius for article look
      maxWidth: '100%', // Full width for article-like appearance
      minWidth: 40,
      // No shadows for clean article appearance
    },
    bubbleCompact: {
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
    },
    bubbleNoAvatar: {
      marginLeft: 36,
    },
    userBubble: {
      backgroundColor: theme.colors.message.user,
      borderRadius: theme.borderRadius.lg,
      marginLeft: 40,
      ...theme.shadows.light,
    },
    assistantBubble: {
      backgroundColor: 'transparent', // No background for article-like appearance
      borderRadius: 0, // No border radius for clean article look
      marginRight: 0, // Remove right margin for full-width appearance
      paddingLeft: 0, // No left padding for full-width
      paddingRight: 0, // No right padding for full-width
      paddingTop: 0, // No top padding
      paddingBottom: theme.spacing.lg, // Space for regenerate button
      borderWidth: 0, // No borders
      // No shadows for clean article appearance
    },
    avatarContainer: {
      width: 28,
      height: 28,
      marginRight: theme.spacing.sm,
    },
    // Clean Article Layout - Container for AI responses
    assistantMessageContainer: {
      flex: 1,
      alignItems: 'flex-start' as const,
      position: 'relative' as const, // For regenerate button positioning
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg, // Increased horizontal padding for more margin
    },
    // Clean Article Layout - No avatar needed
    avatarContainerTop: {
      display: 'none', // Hide avatar completely
    },
    avatar: {
      display: 'none', // Hide avatar completely
    },
    avatarText: {
      display: 'none', // Hide avatar text completely
    },
    messageText: {
      fontSize: theme.fontSizes.md,
      lineHeight: 22,
    },
    userMessageText: {
      color: theme.colors.message.userText,
    },
    // Clean Article Layout - AI text styling (like the reference image)
    assistantMessageText: {
      color: theme.colors.text.primary,
      fontSize: theme.fontSizes.lg, // Slightly larger for better readability
      fontFamily: theme.fontFamily.primary,
      lineHeight: 28, // Generous line height for article readability
      textAlign: 'left' as const, // Natural left-aligned text
      marginLeft: 0, // No left margin since no avatar
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl, // More space for interaction buttons
      fontWeight: theme.fontWeights.normal as '400', // Clean, readable font weight
    },
    // Clean Article Layout - Regenerate button in bottom-right
    regenerateButton: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      zIndex: 1,
      width: 20,
      height: 20,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderRadius: 10,
      opacity: 0.6,
    },
    regenerateButtonVisible: {
      opacity: 0.9,
      backgroundColor: 'transparent',
    },
    disabledButton: {
      opacity: 0.3,
      backgroundColor: 'transparent',
    },
    regenerateIcon: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
      lineHeight: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
    },
    cursor: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.bold as '700',
    },
  });
}; 