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
    // Base styling for assistant messages (article-like)
    assistantMessageBubble: {
      padding: theme.spacing.md,
      borderRadius: 0, // No border radius for article look
      maxWidth: '90%', // Even wider for better response appearance
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
      borderTopRightRadius: theme.borderRadius.xs,
      marginLeft: 40,
    },
    assistantBubble: {
      backgroundColor: 'transparent', // No background for article-like appearance
      borderTopLeftRadius: 0, // No border radius for clean article look
      marginRight: 0, // Remove right margin for centered appearance
      paddingLeft: theme.spacing.lg, // More left padding for better spacing
      paddingRight: theme.spacing.lg, // More right padding for better spacing
      paddingTop: theme.spacing.md, // Restore top padding
      paddingBottom: theme.spacing.lg, // Reduce bottom padding
      borderWidth: 0, // No borders
      // No shadows for clean article appearance
    },
    avatarContainer: {
      width: 28,
      height: 28,
      marginRight: theme.spacing.sm,
    },
    // New container for assistant messages with avatar on top
    assistantMessageContainer: {
      flex: 1,
      alignItems: 'center' as const, // Center the content
      position: 'relative' as const, // Ensure proper positioning for regenerate button
    },
    // Avatar container positioned at the top
    avatarContainerTop: {
      width: 28,
      height: 28,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-start' as const,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.status.info.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.status.info.border,
    },
    avatarText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.semibold as '600',
      color: theme.colors.status.info.primary,
    },
    messageText: {
      fontSize: theme.fontSizes.md,
      lineHeight: 22,
    },
    userMessageText: {
      color: theme.colors.message.userText,
    },
    assistantMessageText: {
      color: theme.colors.text.primary, // Use primary text color for better readability
      fontSize: theme.fontSizes.md,
      lineHeight: 24, // Slightly more line height for better readability
      fontFamily: theme.fontFamily.primary,
    },
    regenerateButton: {
      position: 'absolute',
      bottom: theme.spacing.xs,
      left: theme.spacing.xs,
      zIndex: 1,
      width: 18,
      height: 18,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'transparent', // No background color
      borderRadius: 9,
      opacity: 0.6,
      // No shadows for subtle appearance
    },
    regenerateButtonVisible: {
      opacity: 0.9,
      backgroundColor: 'transparent', // Keep transparent even when visible
    },
    disabledButton: {
      opacity: 0.3,
      backgroundColor: 'transparent', // Keep transparent when disabled
    },
    regenerateIcon: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary, // Use tertiary text color for more visible appearance
      lineHeight: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
    },
    cursor: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.bold as '700',
    },
  });
}; 