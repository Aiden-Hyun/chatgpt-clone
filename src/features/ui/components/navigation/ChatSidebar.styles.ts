import { StyleSheet } from 'react-native';

export const createChatSidebarStyles = (theme: any) => StyleSheet.create({
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
  selectedChatItem: {
    backgroundColor: theme.colors.background.secondary,
  },
  chatItemContent: {
    flex: 1,
    marginLeft: 12,
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