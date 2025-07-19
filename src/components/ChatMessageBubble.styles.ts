import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows, fontWeights } from '../theme';

export const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  messageRowCompact: {
    marginVertical: spacing.xxs,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '70%',
    minWidth: 40,
    ...shadows.light,
  },
  bubbleCompact: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  bubbleNoAvatar: {
    marginLeft: 36,
  },
  userBubble: {
    backgroundColor: colors.message.user,
    borderTopRightRadius: borderRadius.xs,
    marginLeft: 40,
  },
  assistantBubble: {
    backgroundColor: colors.message.assistant,
    borderTopLeftRadius: borderRadius.xs,
    marginRight: 40,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.avatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold as '600',
    color: colors.text.tertiary,
  },
  messageText: {
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.message.userText,
  },
  assistantMessageText: {
    color: colors.message.assistantText,
  },
  regenerateButton: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    zIndex: 1,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5, // Slightly visible by default
  },
  regenerateButtonVisible: {
    opacity: 1, // Fully visible when hovered
  },
  disabledButton: {
    opacity: 0.5,
  },
  regenerateIcon: {
    fontSize: fontSizes.xs,
    color: '#bbb',
    lineHeight: fontSizes.xs,
  },
  cursor: {
    color: colors.text.primary,
  },
});

