import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RoomList } from './RoomList';
import { CreateRoomButton } from './CreateRoomButton';
import { ChatRoom } from '../../../business/chat/entities/ChatRoom';

export interface RoomManagementProps {
  onRoomSelect?: (room: ChatRoom) => void;
  onRoomCreated?: (room: ChatRoom) => void;
  onRoomDeleted?: (roomId: string) => void;
  style?: any;
}

export function RoomManagement({ 
  onRoomSelect, 
  onRoomCreated, 
  onRoomDeleted, 
  style 
}: RoomManagementProps) {
  
  const handleRoomCreated = (room: ChatRoom) => {
    console.log('RoomManagement: Room created', { roomId: room.id, name: room.name });
    onRoomCreated?.(room);
  };

  const handleRoomSelect = (room: ChatRoom) => {
    console.log('RoomManagement: Room selected', { roomId: room.id, name: room.name });
    onRoomSelect?.(room);
  };

  const handleRoomDeleted = (roomId: string) => {
    console.log('RoomManagement: Room deleted', { roomId });
    onRoomDeleted?.(roomId);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <CreateRoomButton 
          onRoomCreated={handleRoomCreated}
          style={styles.createButton}
        />
      </View>
      
      <View style={styles.listContainer}>
        <RoomList 
          onRoomSelect={handleRoomSelect}
          onRoomDelete={handleRoomDeleted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  createButton: {
    width: '100%',
  },
  listContainer: {
    flex: 1,
  },
});
