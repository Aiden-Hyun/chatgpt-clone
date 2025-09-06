// src/features/chat/model/ModelRepository.ts
import { supabase } from "@/shared/lib/supabase";

export const ModelRepository = {
  async get(roomId: number): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("chatrooms")
        .select("model")
        .eq("id", roomId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const model = (data as { model?: string })?.model ?? null;
      return model;
    } catch (e) {
      throw e; // Re-throw the error to be handled by the caller
    }
  },

  async update(roomId: number, model: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("chatrooms")
        .update({ model })
        .eq("id", roomId);

      if (error) {
        throw error;
      }
    } catch (e) {
      throw e; // Re-throw the error to be handled by the caller
    }
  },
};
