import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatRoom } from '../../../business/chat/entities/ChatRoom';
import { useChatRoomViewModel } from '../../../business/chat/view-models/useChatRoomViewModel';
import { useAuth } from '../../auth/context/BridgeAuthContext';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export interface RoomListProps {
  onRoomSelect?: (room: ChatRoom) => void;
  onRoomDelete?: (roomId: string) => void;
}

export function RoomList({ onRoomSelect, onRoomDelete }: RoomListProps) {
  const { session } = useAuth();
  const useCaseFactory = useUseCaseFactory();
  const { 
    rooms, 
    loading, 
    error, 
    deletingRoom, 
    deleteRoom, 
    refreshRooms, 
    clearError 
  } = useChatRoomViewModel({
    createRoomUseCase: useCaseFactory.createCreateRoomUseCase(),
    updateRoomUseCase: useCaseFactory.createUpdateRoomUseCase(),
    deleteRoomUseCase: useCaseFactory.createDeleteRoomUseCase(),
    listRoomsUseCase: useCaseFactory.createListRoomsUseCase()
  }, session);

  const handleDeleteRoom = (room: ChatRoom) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteRoom(room.id);
            if (result.success) {
              onRoomDelete?.(room.id);
            }
          }
        }
      ]
    );
  };

  const handleRoomPress = (room: ChatRoom) => {
    onRoomSelect?.(room);
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderRoomItem = ({ item: room }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.roomItem}
      onPress={() => handleRoomPress(room)}
      disabled={deletingRoom}
    >
      <View style={styles.roomContent}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteRoom(room)}
            disabled={deletingRoom}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.roomMeta}>
          <Text style={styles.modelText}>{room.model}</Text>
          <Text style={styles.lastActivity}>
            {formatLastActivity(room.lastActivity || room.updatedAt)}
          </Text>
        </View>
        
        {room.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {room.lastMessage}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No chat rooms yet</Text>
        <Text style={styles.emptySubtext}>Create your first room to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      renderItem={renderRoomItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      refreshing={loading}
      onRefresh={refreshRooms}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  roomItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomContent: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  lastActivity: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
