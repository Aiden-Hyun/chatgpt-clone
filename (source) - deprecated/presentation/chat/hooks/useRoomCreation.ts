import { useCallback, useMemo } from 'react';

import { UserSession } from '../../../business/interfaces';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useRoomCreation() {
  const useCaseFactory = useUseCaseFactory();
  
  // Create UseCase once using useMemo to prevent recreation
  const createRoomUseCase = useMemo(() => 
    useCaseFactory.createCreateRoomUseCase(), [useCaseFactory]
  );
  
  const createRoom = useCallback(async (model: string, session: UserSession) => {
    try {
      const result = await createRoomUseCase.execute({
        model,
        session
      });
      
      return result;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }, [createRoomUseCase]);
  
  return { createRoom };
}
