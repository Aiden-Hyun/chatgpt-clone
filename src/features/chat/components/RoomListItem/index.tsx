import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontFamily, fontSizes, fontWeights, letterSpacing, shadows, spacing } from '../../../../shared/lib/theme';

const styles = StyleSheet.create({
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.medium
  },
  room: {
    flex: 1,
    padding: spacing.xl,
  },
  roomName: { 
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular as '400',
    color: colors.text.primary,
    lineHeight: 26,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.normal
  },
  deleteButton: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium
  },
  deleteText: {
    fontSize: fontSizes.md,
    color: colors.text.inverted,
    fontWeight: fontWeights.medium as '500',
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide
  },
});

interface ChatRoom {
  id: number;
  name: string;
}

interface Props {
  room: ChatRoom;
  onDelete: () => void;
  onPress: () => void;
}

const RoomListItem: React.FC<Props> = ({ room, onDelete, onPress }) => {
  return (
    <View style={styles.roomContainer}>
      <TouchableOpacity style={styles.room} onPress={onPress}>
        <Text style={styles.roomName}>{room.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoomListItem;
