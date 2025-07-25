// src/features/chat/hooks/useModelSelection.ts
import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

export const useModelSelection = (numericRoomId: number | null) => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');

  useEffect(() => {
    const fetchModel = async () => {
      if (!numericRoomId) return;

      try {
        const { data: chatroomData } = await supabase
          .from('chatrooms')
          .select('model')
          .eq('id', numericRoomId)
          .single();
        
        if (chatroomData?.model) {
          setSelectedModel(chatroomData.model);
        }
      } catch (error) {
        console.error('Failed to fetch model:', error);
      }
    };

    fetchModel();
  }, [numericRoomId]);

  const updateModel = async (model: string) => {
    setSelectedModel(model);
    
    if (numericRoomId) {
      try {
        await supabase
          .from('chatrooms')
          .update({ model })
          .eq('id', numericRoomId);
      } catch (error) {
        console.error('Failed to update model:', error);
      }
    }
  };

  return {
    selectedModel,
    updateModel,
  };
}; 