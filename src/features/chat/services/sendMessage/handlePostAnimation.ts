// src/features/chat/services/sendMessage/handlePostAnimation.ts
import type { Session } from "@/entities/session";
import { ChatMessage } from "../../types";

/**
 * Handles database operations after animation completes
 */
export const handlePostAnimation = async ({
  regenerateIndex,
  roomId,
  fullContent,
  session,
  userMsg,
  originalAssistantContent,
  insertMessages,
  updateAssistantMessage,
}: {
  regenerateIndex?: number;
  roomId: number;
  fullContent: string;
  originalAssistantContent?: string;
  session: Session;
  userMsg: ChatMessage;
  insertMessages: (args: {
    roomId: number;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: Session;
  }) => Promise<void>;
  updateAssistantMessage: (args: {
    roomId: number;
    newContent: string;
    originalContent: string;
    session: Session;
  }) => Promise<void>;
}): Promise<void> => {
  try {
    // If regenerating, update the assistant message in the database
    // Otherwise, insert both user and assistant messages
    if (regenerateIndex !== undefined) {
      if (originalAssistantContent) {
        await updateAssistantMessage({
          roomId,
          newContent: fullContent,
          originalContent: originalAssistantContent,
          session,
        });
      } else {
        console.warn(
          "[regen] originalAssistantContent missing; skipping DB update"
        );
      }
    } else {
      await insertMessages({
        roomId,
        userMessage: userMsg,
        assistantMessage: { role: "assistant", content: fullContent },
        session,
      });
    }
  } catch (error) {
    console.error("❌ Error in handlePostAnimation:", error);
  }
};
