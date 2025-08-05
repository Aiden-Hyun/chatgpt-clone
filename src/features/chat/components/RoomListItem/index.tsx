import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
        <MaterialIcons name="delete" size={20} color={styles.deleteText.color} />
      </TouchableOpacity>
    </View>
  );
};

export default RoomListItem;
