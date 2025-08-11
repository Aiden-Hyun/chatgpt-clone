import { StyleSheet } from 'react-native';

/**
 * RoomListItem Styles
 * Dedicated style file for RoomListItem component
 */
export const createRoomListItemStyles = (theme: any) => {
  
  return StyleSheet.create({
    roomContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.medium
    },
    room: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    roomName: { 
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.regular as '400',
      color: theme.colors.text.primary,
      lineHeight: 26,
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.normal
    },
    deleteButton: {
      width: 32,
      height: 32,
      backgroundColor: theme.colors.background.secondary,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      ...theme.shadows.light
    },
    deleteText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.status.error.primary,
      fontWeight: theme.fontWeights.bold as '700',
      fontFamily: theme.fontFamily.primary,
      lineHeight: 20,
    },
  });
}; 