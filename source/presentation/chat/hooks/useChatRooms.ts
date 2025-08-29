// source/presentation/chat/hooks/useChatRooms.ts
import { useEffect } from 'react';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';
import { useChatRoomViewModel } from '../../../business/chat/view-models/useChatRoomViewModel';
import { useAuth } from '../../auth/context/AuthContext';

export interface ChatRoom {
  id: number;
  name: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export function useChatRooms() {
  const { session } = useAuth();
  const useCaseFactory = useUseCaseFactory();
  
  // Use view model instead of direct UseCase creation
  const chatRoomViewModel = useChatRoomViewModel({
    createRoomUseCase: useCaseFactory.createCreateRoomUseCase(),
    updateRoomUseCase: useCaseFactory.createUpdateRoomUseCase(),
    deleteRoomUseCase: useCaseFactory.createDeleteRoomUseCase(),
    listRoomsUseCase: useCaseFactory.createListRoomsUseCase()
  }, session);

  // Transform rooms data to match the expected interface
  const rooms: ChatRoom[] = chatRoomViewModel.rooms?.map(room => ({
    id: room.id,
    name: room.name,
    last_message: room.lastMessage?.content,
    created_at: room.createdAt.toISOString(),
    updated_at: room.updatedAt.toISOString()
  })) || [];

  const deleteRoom = async (roomId: number) => {
    try {
      const result = await chatRoomViewModel.deleteRoom(roomId);
      return result.success;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  return {
    rooms,
    isLoading: chatRoomViewModel.loading,
    fetchRooms: chatRoomViewModel.refreshRooms,
    deleteRoom
  };
}
