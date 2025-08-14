// src/features/chat/model/useRoomModel.ts
import { useCallback, useEffect, useState } from 'react';
import { ModelRepository } from './ModelRepository';
import { ModelStore, RoomKey, RoomModelState } from './ModelStore';

export function useRoomModel(roomId: number | null) {
  const key: RoomKey = roomId ?? 'new';
  const [state, setState] = useState<RoomModelState>(() =>
    ModelStore.get(key) ?? { model: 'gpt-3.5-turbo', status: 'idle' }
  );

  useEffect(() => {
    if (__DEV__) console.log('[useRoomModel] mount/effect', { roomId, key });
    const unsubscribe = ModelStore.subscribe(key, () => {
      const s = ModelStore.get(key);
      if (s) setState(s);
    });

    (async () => {
      if (roomId) {
        if (__DEV__) console.log('[useRoomModel] load from DB', { roomId });
        ModelStore.set(roomId, { model: state.model, status: 'loading' });
        const fromDb = await ModelRepository.get(roomId);
        if (fromDb) {
          ModelStore.set(roomId, { model: fromDb, status: 'ready' });
        } else {
          ModelStore.set(roomId, { model: state.model, status: 'ready' });
        }
      } else if (!ModelStore.get('new')) {
        if (__DEV__) console.log('[useRoomModel] init pending for new room');
        ModelStore.set('new', { model: 'gpt-3.5-turbo', status: 'ready' });
      }
    })();

    return unsubscribe;
  }, [key, roomId]);

  const setModel = useCallback(
    async (model: string) => {
      if (__DEV__) console.log('[useRoomModel.setModel] change', { key, roomId, model });
      ModelStore.set(key, { model, status: 'ready' });
      if (roomId) {
        await ModelRepository.update(roomId, model);
        if (__DEV__) console.log('[useRoomModel.setModel] persisted', { roomId, model });
      }
    },
    [key, roomId]
  );

  return { model: state.model, setModel, status: state.status };
}


