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
      backgroundColor: theme.colors.message.assistant,
      borderTopLeftRadius: theme.borderRadius.xs,
      marginRight: 40,
    },
    avatarContainer: {
      width: 28,
      height: 28,
      marginRight: theme.spacing.sm,
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
      color: theme.colors.message.assistantText,
    },
    regenerateButton: {
      position: 'absolute',
      bottom: -10,
      right: -20,
      zIndex: 1,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.status.info.primary,
      borderRadius: 10,
      opacity: 0.7,
      ...theme.shadows.light,
    },
    regenerateButtonVisible: {
      opacity: 1,
      backgroundColor: theme.colors.status.info.secondary,
    },
    disabledButton: {
      opacity: 0.4,
      backgroundColor: theme.colors.interactive.disabled.primary,
    },
    regenerateIcon: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.inverted,
      lineHeight: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
    },
    cursor: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.bold as '700',
    },
  });
}; 