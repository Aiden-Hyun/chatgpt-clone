import React from "react";

import type { ChatMessage } from "@/entities/message";

import { ErrorMessage } from "../ErrorMessage";
import { LoadingMessage } from "../LoadingMessage";

import { AssistantMessage } from "./AssistantMessage";
import { SystemMessage } from "./SystemMessage";
import { UserMessage } from "./UserMessage";

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  // ✅ STATE MACHINE: Remove legacy boolean flags - use message.state instead
  isRegenerating?: boolean; // Keep for regeneration tracking by index
  onRegenerate?: () => void;
  onUserEditRegenerate?: (index: number, newText: string) => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  // Like/dislike handlers
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isRegenerating,
  onRegenerate,
  onUserEditRegenerate,
  showAvatar = true,
  isLastInGroup = true,
  onLike,
  onDislike,
}) => {
  // ✅ STATE MACHINE: Use message state for all rendering decisions
  if (message.role === "assistant") {
    switch (message.state) {
      case "loading":
        return <LoadingMessage />;
      case "error":
        return (
          <ErrorMessage
            message={message}
            onRetry={() => {
              if (onRegenerate) {
                onRegenerate();
              }
            }}
          />
        );
      // Continue to render logic below for 'animating', 'completed', 'hydrated' states
    }
  }

  // ✅ STATE MACHINE: Backward compatibility for regeneration by index
  if (isRegenerating && message.role === "assistant") {
    return <LoadingMessage />;
  }

  // Render system message
  if (message.role === "system") {
    return <SystemMessage message={message} />;
  }

  // Render user message
  if (message.role === "user") {
    return (
      <UserMessage
        message={message}
        isLastInGroup={isLastInGroup}
        onSendEdited={(newText: string) =>
          onUserEditRegenerate?.(index, newText)
        }
      />
    );
  }

  // Render assistant message
  if (message.role === "assistant") {
    return (
      <AssistantMessage
        message={message}
        onRegenerate={onRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
        onLike={onLike}
        onDislike={onDislike}
      />
    );
  }

  return null;
};
