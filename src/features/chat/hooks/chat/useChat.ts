// useChat.ts - Coordinator hook that combines individual message hooks with state machine support
import { useCallback, useEffect, useMemo } from "react";

import { useChatRoomSearch, useMessageOrchestrator } from "@/entities/chatRoom";
import { useMessageInput } from "@/entities/message";
import type { AIApiRequest } from "@/entities/message";
import { useAuth } from "@/entities/session";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import { OpenAIResponseProcessor } from "../../services/core/AIResponseProcessor";
import { ServiceRegistry } from "../../services/core/ServiceRegistry";
import { MessageStateManager } from "../../services/MessageStateManager";
import { generateMessageId } from "../../utils/messageIdGenerator";

import { useChatState } from "./useChatState";

type UseChatOptions = {
  selectedModel?: string;
  setModel?: (model: string) => void | Promise<void>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
};

export const useChat = (
  numericRoomId: number | null,
  options?: UseChatOptions
) => {
  const logger = getLogger("useChat");
  const { session } = useAuth();

  // Core state management
  const chatState = useChatState(numericRoomId);
  const {
    messages,
    loading,
    regeneratingIndices,
    getLoadingMessages,
    getAnimatingMessages,
    isNewMessageLoading,
    setMessages,
    startRegenerating,
    stopRegenerating,
    isRegenerating,
  } = chatState;

  // Compute derived state
  const sending = getLoadingMessages().length > 0;
  const isTyping = false;
  const regeneratingIndex =
    regeneratingIndices.size > 0 ? Array.from(regeneratingIndices)[0] : null;

  // Model selection logic - direct implementation
  const selectedModel = options?.selectedModel ?? "gpt-3.5-turbo";
  const updateModel = options?.setModel ?? (() => {});

  // Search mode logic
  const { isSearchMode, onSearchToggle } = useChatRoomSearch(
    selectedModel,
    setMessages
  );

  // Message orchestrator - handles all the complex send logic
  const { sendMessage: sendMessageViaOrchestrator } = useMessageOrchestrator({
    roomId: numericRoomId,
    messages,
    setMessages,
    selectedModel,
    isSearchMode,
  });

  // Input management - using entity hook directly
  const {
    input,
    drafts: _drafts,
    setDrafts: _setDrafts,
    handleInputChange,
    clearInput,
  } = useMessageInput(numericRoomId, false);

  // Log only when dependencies change, not on every render
  useEffect(() => {
    logger.debug(
      `Chat actions dependencies updated: room ${
        numericRoomId || "new"
      }, model ${selectedModel}, search mode ${isSearchMode ? "on" : "off"}, ${
        messages.length
      } messages`
    );
  }, [numericRoomId, isSearchMode, selectedModel, messages.length, logger]);

  // Message actions - simplified implementation using useMessageOrchestrator
  const sendMessageToBackend = useCallback(
    async (userContent: string) => {
      if (!userContent.trim()) return;

      const messageId = generateMessageId();
      const trimmedContent = userContent.trim();

      logger.info("Message send initiated", {
        messageId,
    roomId: numericRoomId,
        model: selectedModel,
    isSearchMode,
        messageLength: trimmedContent.length,
      });

      try {
        const result = await sendMessageViaOrchestrator(trimmedContent);

        if (!result.success) {
          const errorMessage = result.error || "Failed to send message";
          logger.error("Message send failed", {
            messageId,
            roomId: numericRoomId,
            error: errorMessage,
          });
          throw new Error(errorMessage);
        }

        logger.info(
          `Message send completed successfully for room ${
            result.roomId || numericRoomId || "new"
          } with model ${selectedModel}`
        );
      } catch (error) {
        logger.error("Failed to send message", {
          messageId,
          error: error as Error,
        });
        throw error;
      }
    },
    [
      sendMessageViaOrchestrator,
      numericRoomId,
      selectedModel,
      isSearchMode,
      logger,
    ]
  );

  // Create services for regeneration - direct instantiation
  const regenerationServices = useMemo(() => {
    if (!session) return null;

    return {
      messageStateManager: new MessageStateManager(setMessages),
      aiApiService: ServiceRegistry.createAIApiService(),
      messageService: ServiceRegistry.createMessageService(),
      animationService: ServiceRegistry.createAnimationService(setMessages),
      responseProcessor: new OpenAIResponseProcessor(),
    };
  }, [setMessages, session]);

  // Wrapper for sendMessage that handles input clearing and error recovery
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const currentRoomKey = numericRoomId ? numericRoomId.toString() : "new";
    if (__DEV__) {
      logger.debug(`Sending message from room ${currentRoomKey}`);
    }

    clearInput();

    try {
      await sendMessageToBackend(input);
    } catch (error) {
      logger.error(
        `Failed to send message from room ${currentRoomKey}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      handleInputChange(input);
    }
  }, [
    input,
    numericRoomId,
    logger,
    clearInput,
    sendMessageToBackend,
    handleInputChange,
  ]);

  // Regenerate message - inline from MessageRegenerationService
  const regenerateMessage = useCallback(
    async (index: number, overrideUserContent?: string) => {
      if (index === undefined || index === null) {
        logger.error(`Invalid regeneration index: ${index}`);
        return;
      }

      if (!regenerationServices || !session) {
        console.warn("🔄 REGEN-HOOK: No regenerationServices or session");
        return;
      }

      // Validate index is in range at time of click
      if (typeof index !== "number" || index < 0 || index >= messages.length) {
        console.warn(
          "🔄 REGEN-HOOK: Invalid message index for regeneration:",
          index
        );
        return;
      }

      const targetMessage = messages[index];
      if (
        !targetMessage ||
        targetMessage.role !== "assistant" ||
        !targetMessage.id
      ) {
        console.warn(
          "🔄 REGEN-HOOK: Target message invalid for regeneration:",
          targetMessage
        );
        return;
      }

      // Ensure there's a user message before this
      const userMessage = index > 0 ? messages[index - 1] : null;
      if (!userMessage || userMessage.role !== "user") {
        console.warn(
          "🔄 REGEN-HOOK: No user message found before assistant message"
        );
        return;
      }

      // Ensure we have user content to condition the regen prompt
      if (!overrideUserContent && !userMessage.content) {
        console.warn("🔄 REGEN-HOOK: Missing user content for regeneration");
        return;
      }

      const targetMessageId = targetMessage.id;
      const {
        messageStateManager,
        aiApiService,
        messageService,
        animationService,
        responseProcessor,
      } = regenerationServices;

      // Start tracking regeneration for UI updates
      startRegenerating(index);

      try {
        // Set loading state (single atomic update using id)
        messageStateManager.transition(targetMessageId, "loading");

        // Prepare history from the snapshot (all messages before the assistant message)
        // Filter only role, content, id to avoid UI-only fields affecting the prompt
        const messageHistory = messages
          .slice(0, index)
          .map((m) => ({
            role: m.role,
            content: m.content || "",
            id: m.id,
            state: m.state,
          }));

        // If caller provided an override for the immediate previous user message, apply it
        let finalHistory = messageHistory;
        const userContent = overrideUserContent ?? userMessage.content;
        if (userContent && userContent.trim().length > 0) {
          const lastIdx = messageHistory.length - 1;
          if (lastIdx >= 0 && messageHistory[lastIdx]?.role === "user") {
            const overridden = {
              ...messageHistory[lastIdx],
              content: userContent,
            };
            finalHistory = messageHistory.slice(0, lastIdx).concat(overridden);
          }
        }

        // Call AI API with idempotency and skipPersistence (server should not write on regen)
        const apiRequest: AIApiRequest = {
          roomId: numericRoomId!,
          messages: finalHistory,
          model: selectedModel,
          clientMessageId: targetMessageId,
          skipPersistence: true,
        };

        // Determine which token to use
        let accessToken = session.access_token;

        if (
          session.expires_at &&
          Math.floor(Date.now() / 1000) > session.expires_at
        ) {
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (!error && data.session) {
              accessToken = data.session.access_token;
            } else {
              console.warn(
                "🔄 REGEN-SERVICE: Session refresh failed, proceeding with existing token"
              );
            }
          } catch {
            console.warn(
              "🔄 REGEN-SERVICE: Session refresh threw, proceeding with existing token"
            );
          }
        }

        const apiResponse = await aiApiService.sendMessage(
          apiRequest,
          accessToken,
          isSearchMode
        );

        // Use the same response processor as MessageSenderService for consistent handling
        if (!responseProcessor.validateResponse(apiResponse)) {
          console.error("🔄 REGEN-SERVICE: API response missing content");
          throw new Error("No content in AI response");
        }

        const newContent = responseProcessor.extractContent(apiResponse);
        if (!newContent) {
          console.error(
            "🔄 REGEN-SERVICE: No content extracted from API response"
          );
          throw new Error("No content in AI response");
        }

        // Drive UI state and animation
        messageStateManager.handleRegeneration(targetMessageId, newContent);
        animationService.setMessageFullContentAndAnimate({
          fullContent: newContent,
          messageId: targetMessageId,
        });

        // Persist if room exists
        if (numericRoomId) {
          try {
            // Prefer updating by database id when available (ids loaded as `db:<id>`)
            if (targetMessageId.startsWith("db:")) {
              const dbIdStr = targetMessageId.slice(3);
              const dbId = Number(dbIdStr);
              if (
                !Number.isNaN(dbId) &&
                (
                  messageService as {
                    updateAssistantMessageByDbId?: unknown;
                  }
                ).updateAssistantMessageByDbId
              ) {
                await (
                  messageService as {
                    updateAssistantMessageByDbId: (
                      params: unknown
                    ) => Promise<unknown>;
                  }
                ).updateAssistantMessageByDbId({
                  dbId,
                  newContent,
                  session: session,
                });
              }
            } else if (
              (
                messageService as {
                  updateAssistantMessageByClientId?: unknown;
                }
              ).updateAssistantMessageByClientId &&
              numericRoomId
            ) {
              await (
                messageService as {
                  updateAssistantMessageByClientId: (
                    params: unknown
                  ) => Promise<unknown>;
                }
              ).updateAssistantMessageByClientId({
                roomId: numericRoomId,
                messageId: targetMessageId,
                newContent,
                session: session,
              });
            }

            // Also persist edited user message if it came from DB and content changed
            const userIndex = index - 1;
            if (userIndex >= 0 && messages[userIndex]?.role === "user") {
              const userMsg = messages[userIndex];
              if (
                userMsg?.id &&
                typeof userMsg.id === "string" &&
                userMsg.id.startsWith("db:") &&
                userContent &&
                userContent.trim().length > 0 &&
                userContent !== userMsg.content &&
                (messageService as { updateUserMessageByDbId?: unknown })
                  .updateUserMessageByDbId
              ) {
                const userDbId = Number(userMsg.id.slice(3));
                if (!Number.isNaN(userDbId)) {
                  await (
                    messageService as {
                      updateUserMessageByDbId: (
                        params: unknown
                      ) => Promise<unknown>;
                    }
                  ).updateUserMessageByDbId({
                    dbId: userDbId,
                    newContent: userContent,
                    session: session,
                  });
                }
              }
            }
          } catch (dbError) {
            console.error("🔄 REGEN-SERVICE: DB update failed", dbError);
          }
        }
      } catch (error) {
        logger.error(
          `Error regenerating message at index ${index}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        console.error(
          "🔄 REGEN-SERVICE: Failed to regenerate message",
          {
            index,
            error,
          }
        );
        // Best-effort error state using snapshot index fallback
        setMessages((prev) => {
          if (index < 0 || index >= prev.length) return prev;
          const t = prev[index];
          if (!t?.id) return prev;
          const updated = prev.slice();
          updated[index] = { ...t, state: "error" };
          return updated;
        });
        throw error;
      } finally {
        // Always stop tracking regardless of success/failure
        stopRegenerating(index);
      }
    },
    [
      messages,
      regenerationServices,
      session,
      numericRoomId,
      selectedModel,
      isSearchMode,
      setMessages,
      startRegenerating,
      stopRegenerating,
      logger,
    ]
  );

  // Edit a user message in place and regenerate the following assistant message using the edited text
  const editUserAndRegenerate = useCallback(
    async (userIndex: number, newText: string) => {
      if (
        typeof userIndex !== "number" ||
        userIndex < 0 ||
        userIndex >= messages.length
      )
        return;

      // Update UI bubble immediately
      setMessages((prev) => {
        if (userIndex < 0 || userIndex >= prev.length) return prev;
        const target = prev[userIndex];
        if (!target || target.role !== "user") return prev;
        const updated = [...prev];
        updated[userIndex] = { ...target, content: newText };
        return updated;
      });

      // Regenerate the next assistant message with the edited text
      const assistantIndex = userIndex + 1;
      await regenerateMessage(assistantIndex, newText);
    },
    [messages, setMessages, regenerateMessage]
  );

  // Memoize the return object to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      // State
      messages,
      loading,
      sending,
      isTyping,
      regeneratingIndex,
      regeneratingIndices,
      isNewMessageLoading,
      getLoadingMessages,
      getAnimatingMessages,
      isRegenerating,

      // Input
      input,
      handleInputChange,

      // Actions
      sendMessage,
      regenerateMessage,
      editUserAndRegenerate,

      // Model
      selectedModel,
      updateModel,

      // Search
      isSearchMode,
      onSearchToggle,

      // State setters (for advanced usage)
      setMessages,
    }),
    [
      messages,
      loading,
      sending,
      isTyping,
      regeneratingIndex,
      regeneratingIndices,
      isNewMessageLoading,
      getLoadingMessages,
      getAnimatingMessages,
      isRegenerating,
      input,
      handleInputChange,
      sendMessage,
      regenerateMessage,
      editUserAndRegenerate,
      selectedModel,
      updateModel,
      isSearchMode,
      onSearchToggle,
      setMessages,
    ]
  );

  return result;
};
