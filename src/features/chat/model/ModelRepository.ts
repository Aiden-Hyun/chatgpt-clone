// src/features/chat/model/ModelRepository.ts
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

const logger = getLogger("ModelRepository");

export const ModelRepository = {
  async get(roomId: number): Promise<string | null> {
    try {
      if (__DEV__) logger.debug("fetch model for room", { roomId });
      const { data } = await supabase
        .from("chatrooms")
        .select("model")
        .eq("id", roomId)
        .maybeSingle();
      const model = (data as { model?: string })?.model ?? null;
      if (__DEV__) logger.debug("result", { roomId, model });
      return model;
    } catch (e) {
      logger.error("error", { error: e });
      return null;
    }
  },

  async update(roomId: number, model: string): Promise<void> {
    try {
      if (__DEV__) logger.debug("update model", { roomId, model });
      await supabase.from("chatrooms").update({ model }).eq("id", roomId);
      if (__DEV__) logger.debug("done", { roomId, model });
    } catch (e) {
      logger.error("error", { error: e });
    }
  },
};
