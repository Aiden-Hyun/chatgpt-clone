// src/features/chat/model/ModelStore.ts
import { getLogger } from "@/shared/services/logger";

export type RoomKey = number | "new";
export type RoomModelState = {
  model: string;
  status: "idle" | "loading" | "ready" | "error";
};

const logger = getLogger("ModelStore");

const store = new Map<RoomKey, RoomModelState>();
const listeners = new Map<RoomKey, Set<() => void>>();

export const ModelStore = {
  get(key: RoomKey): RoomModelState | undefined {
    return store.get(key);
  },

  set(key: RoomKey, next: RoomModelState): void {
    if (__DEV__) logger.debug("set", { key, next });
    store.set(key, next);
    const subs = listeners.get(key);
    if (subs)
      subs.forEach((cb) => {
        try {
          cb();
        } catch {}
      });
  },

  subscribe(key: RoomKey, cb: () => void): () => void {
    if (__DEV__) logger.debug("subscribe add", { key });
    const set = listeners.get(key) ?? new Set<() => void>();
    set.add(cb);
    listeners.set(key, set);
    return () => {
      if (__DEV__) logger.debug("subscribe remove", { key });
      const s = listeners.get(key);
      if (!s) return;
      s.delete(cb);
    };
  },

  attachPendingToRoom(newRoomId: number): void {
    if (__DEV__) logger.debug("attachPendingToRoom", { newRoomId });
    const pending = store.get("new");
    if (pending) store.set(newRoomId, pending);
    store.delete("new");
  },
};
