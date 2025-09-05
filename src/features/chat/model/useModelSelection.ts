// src/features/chat/model/useModelSelection.ts
import { useCallback, useEffect, useState } from "react";

import { getLogger } from "@/shared/services/logger";

import { ModelRepository } from "./ModelRepository";
import { ModelStore, RoomKey, RoomModelState } from "./ModelStore";

const logger = getLogger("useModelSelection");

export function useModelSelection(roomId: number | null) {
  const key: RoomKey = roomId ?? "new";
  const [state, setState] = useState<RoomModelState>(
    () => ModelStore.get(key) ?? { model: "gpt-3.5-turbo", status: "idle" }
  );

  useEffect(() => {
    const unsubscribe = ModelStore.subscribe(key, () => {
      const s = ModelStore.get(key);
      if (s) setState(s);
    });

    (async () => {
      if (roomId) {
        ModelStore.set(roomId, { model: state.model, status: "loading" });
        const fromDb = await ModelRepository.get(roomId);
        if (fromDb) {
          ModelStore.set(roomId, { model: fromDb, status: "ready" });
        } else {
          ModelStore.set(roomId, { model: state.model, status: "ready" });
          // try { router.replace('/chat'); } catch {}
        }
      } else if (!ModelStore.get("new")) {
        ModelStore.set("new", { model: "gpt-3.5-turbo", status: "ready" });
      }
    })();

    return unsubscribe;
  }, [key, roomId]);

  const setModel = useCallback(
    async (model: string) => {
      ModelStore.set(key, { model, status: "ready" });
      if (roomId) {
        await ModelRepository.update(roomId, model);
      }
    },
    [key, roomId]
  );

  return { model: state.model, setModel, status: state.status };
}
