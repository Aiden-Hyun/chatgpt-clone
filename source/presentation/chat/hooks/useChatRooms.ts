// source/presentation/chat/hooks/useChatRooms.ts
import { useEffect, useState } from 'react';
import { isSuccess } from '../../../business/shared/types/Result';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

export interface ChatRoom {
  id: number;
  name: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { useCaseFactory, businessProvider } = useBusinessContext();
  
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const listRoomsUseCase = useCaseFactory.createListRoomsUseCase();
      const session = await businessProvider.getSessionRepository().get();
      
      if (!session) {
        console.error('No active session found');
        setRooms([]);
        return;
      }
      
      const result = await listRoomsUseCase.execute({ session });
      
      if (isSuccess(result)) {
        const roomsData = result.data;
        setRooms(roomsData.map(room => ({
          id: room.id,
          name: room.name,
          last_message: room.lastMessage?.content,
          created_at: room.createdAt.toISOString(),
          updated_at: room.updatedAt.toISOString()
        })));
      } else {
        console.error('Failed to fetch rooms:', result.error);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      const deleteRoomUseCase = useCaseFactory.createDeleteRoomUseCase();
      const session = await businessProvider.getSessionRepository().get();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      const result = await deleteRoomUseCase.execute({ 
        roomId, 
        session 
      });
      
      if (isSuccess(result)) {
        // Remove the deleted room from the local state
        setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    isLoading,
    fetchRooms,
    deleteRoom
  };
}
