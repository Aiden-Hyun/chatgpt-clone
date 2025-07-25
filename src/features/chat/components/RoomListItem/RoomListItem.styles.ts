import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

/**
 * RoomListItem Styles
 * Dedicated style file for RoomListItem component
 */
export const createRoomListItemStyles = () => {
  const theme = useAppTheme();
  
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
      padding: theme.spacing.md,
      backgroundColor: theme.colors.status.error.primary,
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.medium
    },
    deleteText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.inverted,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.wide
    },
  });
}; 