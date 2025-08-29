import { useCallback, useEffect, useState } from 'react';
import { IUserSession, ChatRoomState, ChatRoomActions } from '../../interfaces';
import { CreateRoomUseCase } from '../use-cases/CreateRoomUseCase';
import { DeleteRoomUseCase } from '../use-cases/DeleteRoomUseCase';
import { ListRoomsUseCase } from '../use-cases/ListRoomsUseCase';
import { UpdateRoomUseCase } from '../use-cases/UpdateRoomUseCase';



interface ChatRoomViewModelDependencies {
  createRoomUseCase: CreateRoomUseCase;
  updateRoomUseCase: UpdateRoomUseCase;
  deleteRoomUseCase: DeleteRoomUseCase;
  listRoomsUseCase: ListRoomsUseCase;
}

export function useChatRoomViewModel(dependencies: ChatRoomViewModelDependencies, session: IUserSession | null): ChatRoomState & ChatRoomActions {
  
  const [state, setState] = useState<ChatRoomState>({
    rooms: [],
    loading: false,
    error: null,
    creatingRoom: false,
    updatingRoom: false,
    deletingRoom: false,
  });

  // Destructure injected dependencies
  const {
    createRoomUseCase,
    updateRoomUseCase,
    deleteRoomUseCase,
    listRoomsUseCase
  } = dependencies;

  const createRoom = useCallback(async (model: string, name?: string) => {
    if (!session) {
      const error = 'Authentication required';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ ...prev, creatingRoom: true, error: null }));

    try {
      const result = await createRoomUseCase.execute({ model, name, session });
      
      if (result.success && result.room) {
        // Add new room to the beginning of the list
        setState(prev => ({ 
          ...prev, 
          rooms: [result.room!, ...prev.rooms],
          creatingRoom: false 
        }));
        return { success: true, room: result.room };
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to create room',
          creatingRoom: false 
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        creatingRoom: false 
      }));
      return { success: false, error: errorMessage };
    }
  }, [session, createRoomUseCase]);

  const updateRoom = useCallback(async (roomId: string, updates: { name?: string; model?: string }) => {
    if (!session) {
      const error = 'Authentication required';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ ...prev, updatingRoom: true, error: null }));

    try {
      const result = await updateRoomUseCase.execute({ 
        roomId, 
        name: updates.name, 
        model: updates.model, 
        session 
      });
      
      if (result.success && result.room) {
        // Update room in the list
        setState(prev => ({ 
          ...prev, 
          rooms: prev.rooms.map(room => 
            room.id === roomId ? result.room! : room
          ),
          updatingRoom: false 
        }));
        return { success: true, room: result.room };
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to update room',
          updatingRoom: false 
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        updatingRoom: false 
      }));
      return { success: false, error: errorMessage };
    }
  }, [session, updateRoomUseCase]);

  const deleteRoom = useCallback(async (roomId: string) => {
    if (!session) {
      const error = 'Authentication required';
      setState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    setState(prev => ({ ...prev, deletingRoom: true, error: null }));

    try {
      const result = await deleteRoomUseCase.execute({ roomId, session });
      
      if (result.success) {
        // Remove room from the list
        setState(prev => ({ 
          ...prev, 
          rooms: prev.rooms.filter(room => room.id !== roomId),
          deletingRoom: false 
        }));
        return { success: true };
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to delete room',
          deletingRoom: false 
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        deletingRoom: false 
      }));
      return { success: false, error: errorMessage };
    }
  }, [session, deleteRoomUseCase]);

  const listRooms = useCallback(async () => {
    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await listRoomsUseCase.execute({ session });
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          rooms: result.rooms || [],
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: result.error || 'Failed to load rooms',
          loading: false 
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load rooms';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        loading: false 
      }));
    }
  }, [session, listRoomsUseCase]);

  const refreshRooms = useCallback(async () => {
    await listRooms();
  }, [listRooms]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-load rooms when session is available
  useEffect(() => {
    if (session) {
      listRooms();
    }
  }, [session, listRooms]);

  return {
    ...state,
    createRoom,
    updateRoom,
    deleteRoom,
    listRooms,
    clearError,
    refreshRooms,
  };
}
