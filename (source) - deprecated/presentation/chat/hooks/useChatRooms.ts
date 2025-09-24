// source/presentation/chat/hooks/useChatRooms.ts
import { useChatRoomViewModel } from '../../../business/chat/view-models/useChatRoomViewModel';
import { useAuth } from '../../auth/context/AuthContext';
import { ChatRoom } from '../../interfaces/chat';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

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
    id: room.id.toString(),
    title: room.name,
    model: 'gpt-4', // Default model, should be updated based on actual data
    created_at: room.createdAt.toISOString(),
    updated_at: room.updatedAt.toISOString(),
    user_id: session?.user?.id || '',
    last_message: room.lastMessage ? {
      content: room.lastMessage.content,
      created_at: room.lastMessage.createdAt.toISOString()
    } : undefined
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
