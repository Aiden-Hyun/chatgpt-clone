import { useCallback, useEffect, useMemo, useState } from "react";

import type { ChatMessage } from "@/entities/message";
import { getLogger } from "@/shared/services/logger";

import { getModelInfo } from "../../../features/chat/constants/models";
import { generateMessageId } from "../../../features/chat/utils/messageIdGenerator";
import mobileStorage from "../../../shared/lib/mobileStorage";

export const useChatRoomSearch = (
  selectedModel: string,
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const logger = getLogger("useChatSearch");

  // Search mode state - persist across room changes
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Log only on mount
  useEffect(() => {
    logger.debug(`Chat search hook initialized with model ${selectedModel}`);
  }, []);

  // Load search mode from storage on mount
  useEffect(() => {
    const loadSearchMode = async () => {
      try {
        const saved = await mobileStorage.getItem("chat_search_mode");
        if (saved === "true") {
          setIsSearchMode(true);
          // Add system message if search mode was already on
          if (setMessages) {
            const systemMessage: ChatMessage = {
              role: "system",
              content: "🌐 Web search mode ON",
              id: generateMessageId(),
              state: "completed",
            };
            setMessages((prev) => [...prev, systemMessage]);
          }
        } else {
          setIsSearchMode(false);
        }
      } catch {
        // Ignore storage errors
      }
    };
    loadSearchMode();
  }, [setMessages]);

  // Auto-disable search mode when switching to a model that doesn't support search
  useEffect(() => {
    const modelInfo = getModelInfo(selectedModel);
    if (isSearchMode && !modelInfo?.capabilities.search) {
      setIsSearchMode(false);
      // Update storage
      mobileStorage.setItem("chat_search_mode", "false").catch(() => {
        // Ignore storage errors
      });
    }
  }, [selectedModel, isSearchMode]);

  // Log when state changes (not every render)
  useEffect(() => {
    logger.debug(
      `Search mode changed to ${
        isSearchMode ? "enabled" : "disabled"
      } for model ${selectedModel}`
    );
  }, [isSearchMode, selectedModel]);

  const handleSearchToggle = useCallback(() => {
    // Check if the selected model supports search
    const modelInfo = getModelInfo(selectedModel);
    if (!modelInfo?.capabilities.search) {
      return;
    }

    setIsSearchMode((prev) => {
      const newValue = !prev;
      // Persist to mobile storage
      mobileStorage
        .setItem("chat_search_mode", newValue.toString())
        .catch(() => {
          // Ignore storage errors
        });

      // Add system message when search mode is toggled
      if (setMessages) {
        const systemMessage: ChatMessage = {
          role: "system",
          content: newValue
            ? "🌐 Web search mode ON"
            : "🌐 Web search mode OFF",
          id: generateMessageId(),
          state: "completed",
        };

        setMessages((prev) => [...prev, systemMessage]);
      }

      return newValue;
    });
  }, [selectedModel, setMessages]);

  // Stable return reference
  const result = useMemo(
    () => ({
      isSearchMode,
      onSearchToggle: handleSearchToggle,
    }),
    [isSearchMode, handleSearchToggle]
  );

  return result;
};
