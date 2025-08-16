import { StyleSheet } from 'react-native';
import { AppTheme } from '../../theme/theme.types';

export const createChatSidebarStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    sidebarOverlay: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebarBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.feedback.overlay.medium,
    },
    sidebar: {
      width: 360,
      backgroundColor: theme.colors.background.primary,
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    newChatButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
    },
    newChatText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    chatHistory: {
      flex: 1,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    chatItemMain: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    selectedChatItem: {
      backgroundColor: theme.colors.background.secondary,
    },
    chatItemContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    chatItemTitle: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
      fontFamily: theme.fontFamily.primary,
    },
    selectedChatItemTitle: {
      color: theme.colors.primary,
    },
    chatItemSubtitle: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },
    chatItemTime: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
      fontFamily: theme.fontFamily.primary,
    },
    chatItemMeta: {
      alignItems: 'flex-end',
    },
    draftBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      backgroundColor: theme.colors.feedback.selection.primary,
      borderRadius: theme.borderRadius.xs,
      marginRight: theme.spacing.xs,
    },
    draftBadgeText: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.status.info.primary,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.semibold as '600',
    },
    draftBadgeSmall: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      backgroundColor: theme.colors.feedback.selection.primary,
      borderRadius: theme.borderRadius.xs,
      marginBottom: 4,
    },
    draftBadgeTextSmall: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.status.info.primary,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.semibold as '600',
    },
    chatItemDelete: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.xs,
    },
    userProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    settingsButton: {
      padding: theme.spacing.sm,
    },
  });
}; 