import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ChatRoom } from '../../interfaces/chat';

import { CreateRoomButton } from './CreateRoomButton';
import { RoomList } from './RoomList';

export interface RoomManagementProps {
  onRoomSelect?: (room: ChatRoom) => void;
  onRoomCreated?: (room: ChatRoom) => void;
  onRoomDeleted?: (roomId: string) => void;
  style?: Record<string, unknown>;
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
