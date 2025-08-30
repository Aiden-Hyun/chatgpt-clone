// source/presentation/chat/hooks/useModelSelection.ts
import { useCallback, useState, useMemo } from 'react';

import { useAuth } from '../../auth/context/AuthContext';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useModelSelection(roomId?: number | null) {
  // Default to GPT-3.5 Turbo
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const useCaseFactory = useUseCaseFactory();
  const { session } = useAuth();
  
  // Create UseCase once at hook level
  const updateRoomUseCase = useMemo(() => 
    useCaseFactory.createUpdateRoomUseCase(), [useCaseFactory]
  );
  
  const handleModelChange = useCallback(async (model: string) => {
    setSelectedModel(model);
    
    // If we have a roomId and session, persist the model selection using UseCase
    if (roomId && session) {
      try {
        const result = await updateRoomUseCase.execute({ 
          roomId: roomId.toString(), 
          model,
          session
        });
        
        if (result.success) {
          console.log('[useModelSelection] Updated model for room', roomId, 'to', model);
        } else {
          console.error('[useModelSelection] Failed to update room model:', result.error);
        }
      } catch (error) {
        console.error('[useModelSelection] Failed to update room model:', error);
      }
    }
  }, [roomId, session, updateRoomUseCase]);
  
  return {
    selectedModel,
    handleModelChange,
  };
}
