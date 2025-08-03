import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createRoomListItemStyles } from './RoomListItem.styles';

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
  // Get styles from dedicated style file
  const styles = createRoomListItemStyles();
  
  return (
    <View style={styles.roomContainer}>
      <TouchableOpacity style={styles.room} onPress={onPress}>
        <Text style={styles.roomName}>{room.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoomListItem;
