// src/features/chat/model/ModelRepository.ts
import { supabase } from '../../service/lib/supabase';

export const ModelRepository = {
  async get(roomId: number): Promise<string | null> {
    try {
      if (__DEV__) console.log('[ModelRepository.get] fetch model for room', roomId);
      const { data } = await supabase
        .from('chatrooms')
        .select('model')
        .eq('id', roomId)
        .maybeSingle();
      const model = (data as any)?.model ?? null;
      if (__DEV__) console.log('[ModelRepository.get] result', { roomId, model });
      return model;
    } catch (e) {
      console.error('[ModelRepository.get] error', e);
      return null;
    }
  },

  async update(roomId: number, model: string): Promise<void> {
    try {
      if (__DEV__) console.log('[ModelRepository.update] update model', { roomId, model });
      await supabase
        .from('chatrooms')
        .update({ model })
        .eq('id', roomId);
      if (__DEV__) console.log('[ModelRepository.update] done', { roomId, model });
    } catch (e) {
      console.error('[ModelRepository.update] error', e);
    }
  },
};


