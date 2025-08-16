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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
      width: 320,
      backgroundColor: theme.colors.background.primary,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border.light,
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    newChatButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background.secondary,
    },
    newChatText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    chatHistory: {
      flex: 1,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
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
      marginLeft: 12,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    chatItemTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
      fontFamily: theme.fontFamily.primary,
    },
    selectedChatItemTitle: {
      color: theme.colors.primary,
    },
    chatItemSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontFamily: theme.fontFamily.primary,
    },
    chatItemTime: {
      fontSize: 11,
      color: theme.colors.text.tertiary,
      fontFamily: theme.fontFamily.primary,
    },
    chatItemMeta: {
      alignItems: 'flex-end',
    },
    draftBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: theme.colors.feedback.selection.primary,
      borderRadius: 6,
      marginRight: 6,
    },
    draftBadgeText: {
      fontSize: 10,
      color: theme.colors.status.info.primary,
      fontFamily: theme.fontFamily.primary,
      fontWeight: '600',
    },
    draftBadgeSmall: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: theme.colors.feedback.selection.primary,
      borderRadius: 6,
      marginBottom: 4,
    },
    draftBadgeTextSmall: {
      fontSize: 9,
      color: theme.colors.status.info.primary,
      fontFamily: theme.fontFamily.primary,
      fontWeight: '600',
    },
    chatItemDelete: {
      marginLeft: 8,
      padding: 6,
      borderRadius: 6,
    },
    userProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      fontFamily: theme.fontFamily.primary,
    },
    settingsButton: {
      padding: 8,
    },
  });
}; 