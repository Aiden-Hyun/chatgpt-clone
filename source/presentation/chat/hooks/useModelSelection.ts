// source/presentation/chat/hooks/useModelSelection.ts
import { useCallback, useState } from 'react';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

export function useModelSelection(roomId?: number | null) {
  // Default to GPT-3.5 Turbo
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const { useCaseFactory } = useBusinessContext();
  
  const handleModelChange = useCallback(async (model: string) => {
    setSelectedModel(model);
    
    // If we have a roomId, we could persist the model selection
    if (roomId) {
      try {
        // In a real implementation, we would use a use case to update the room's model
        // const updateRoomUseCase = useCaseFactory.createUpdateRoomUseCase();
        // await updateRoomUseCase.execute({ roomId, model });
        console.log('[useModelSelection] Updated model for room', roomId, 'to', model);
      } catch (error) {
        console.error('[useModelSelection] Failed to update room model:', error);
      }
    }
  }, [roomId, useCaseFactory]);
  
  return {
    selectedModel,
    handleModelChange,
  };
}
