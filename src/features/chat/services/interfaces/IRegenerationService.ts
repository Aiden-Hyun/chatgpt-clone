// src/features/chat/services/interfaces/IRegenerationService.ts
import type { ChatMessage } from "@/entities/message";

/**
 * Interface for handling message regeneration
 */
export interface IRegenerationService {
  /**
   * Regenerate a message with new content
   * @param messageId The ID of the assistant message to regenerate
   * @param messages The full messages array (used to compute history and index)
   * @param userContent The user message content to generate from
   * @param originalContent The original assistant message content
   * @returns Promise that resolves when regeneration is complete
   */
  regenerateMessage(
    messageId: string,
    messages: ChatMessage[],
    userContent: string,
    originalContent: string
  ): Promise<void>;

  /**
   * Check if a specific message index is currently regenerating
   * @param index The index to check
   * @returns Whether the message is regenerating
   */
  isRegenerating(index: number): boolean;
}
