import React from "react";
import { View } from "react-native";

import type { ChatMessage } from "@/entities/message";

import { copy as copyToClipboard } from "../../../../shared/lib/clipboard";
import { useToast } from "../../../alert";
import { useAppTheme } from "../../../theme/theme";
import { AssistantMessageBar } from "../AssistantMessageBar";
import { MarkdownRenderer } from "../MarkdownRenderer";

import { createAssistantMessageStyles } from "./AssistantMessage.styles";

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  // Like/dislike handlers
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = React.memo(
  function AssistantMessage({
    message,
    onRegenerate,
    showAvatar = true, // (kept for future use)
    isLastInGroup = true,
    onLike,
    onDislike,
  }: AssistantMessageProps) {
    const theme = useAppTheme();

    // Memoize styles to prevent re-creation on every render
    const styles = React.useMemo(
      () => createAssistantMessageStyles(theme),
      [theme]
    );
    const { showSuccess, showError } = useToast();
    const isAnimating = message.state === "animating";
    // When animating, show the orchestrator-provided substring in message.content.
    // After completion, prefer message.content; fall back to fullContent for hydration.
    const contentToShow = isAnimating
      ? message.content || ""
      : message.content || message.fullContent || "";

    const handleLike = () => {
      if (message.id && onLike) {
        onLike(message.id);
      }
    };

    const handleDislike = () => {
      if (message.id && onDislike) {
        onDislike(message.id);
      }
    };

    return (
      <View style={[styles.container, !isLastInGroup && styles.compact]}>
        <MarkdownRenderer isAnimating={isAnimating}>
          {contentToShow}
        </MarkdownRenderer>

        {/* Message interaction bar - always show for assistant messages */}
        {isLastInGroup && !isAnimating && (
          <AssistantMessageBar
            onRegenerate={onRegenerate}
            onLike={handleLike}
            onDislike={handleDislike}
            isLiked={message.isLiked}
            isDisliked={message.isDisliked}
            onCopy={async () => {
              try {
                const text = message.fullContent || message.content || "";
                await copyToClipboard(text);
                try {
                  showSuccess("Copied to clipboard");
                } catch {}
              } catch {
                try {
                  showError("Failed to copy");
                } catch {}
              }
            }}
          />
        )}
      </View>
    );
  }
);
