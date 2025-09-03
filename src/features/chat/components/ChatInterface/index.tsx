import type { ChatMessage } from "@/entities/message";
import React from "react";
import { View } from "react-native";
import { createChatStyles } from "~/app/chat/chat.styles";
import { useAppTheme } from "../../../theme/theme";
import { useChat } from "../../hooks";
import MessageList from "../MessageList";

interface ChatInterfaceProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  selectedModel?: string;
  onChangeModel?: (model: string) => void | Promise<void>;
  // New props to expose chat state to parent
  onChatStateChange?: (state: {
    input: string;
    handleInputChange: (text: string) => void;
    sendMessage: () => void;
    sending: boolean;
    isTyping: boolean;
    isSearchMode: boolean;
    onSearchToggle: () => void;
  }) => void;
}

/**
 * ChatInterface - Messages Only Component
 *
 * This component now only handles messages, with chat input moved to parent.
 * This provides better layout control and responsive behavior.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  roomId,
  initialModel = "gpt-3.5-turbo",
  className,
  showHeader = true,
  selectedModel,
  onChangeModel,
  onChatStateChange,
}) => {
  // Get proven styles - memoized to prevent excessive re-renders
  const theme = useAppTheme();
  const styles = React.useMemo(() => createChatStyles(theme), [theme]);

  // Use the existing proven chat hook
  const {
    messages,
    loading,
    sending,
    isTyping,
    regeneratingIndex,
    input,
    handleInputChange,
    sendMessage,
    regenerateMessage,
    editUserAndRegenerate,
    setMessages,
    isSearchMode,
    onSearchToggle,
  } = useChat(roomId || null, { selectedModel, setModel: onChangeModel });

  // Memoize the chat state object to prevent unnecessary parent re-renders
  const chatState = React.useMemo(
    () => ({
      input,
      handleInputChange,
      sendMessage,
      sending,
      isTyping,
      isSearchMode,
      onSearchToggle,
    }),
    [
      input,
      handleInputChange,
      sendMessage,
      sending,
      isTyping,
      isSearchMode,
      onSearchToggle,
    ]
  );

  // Expose chat state to parent component
  React.useEffect(() => {
    if (onChatStateChange) {
      onChatStateChange(chatState);
    }
  }, [chatState, onChatStateChange]);

  // Like/dislike handlers
  const handleLike = React.useCallback(
    (messageId: string) => {
      setMessages((prev: ChatMessage[]) =>
        prev.map((msg: ChatMessage) =>
          msg.id === messageId
            ? {
                ...msg,
                isLiked: msg.isLiked ? false : true,
                isDisliked: false,
              }
            : msg
        )
      );
    },
    [setMessages]
  );

  const handleDislike = React.useCallback(
    (messageId: string) => {
      setMessages((prev: ChatMessage[]) =>
        prev.map((msg: ChatMessage) =>
          msg.id === messageId
            ? {
                ...msg,
                isLiked: false,
                isDisliked: msg.isDisliked ? false : true,
              }
            : msg
        )
      );
    },
    [setMessages]
  );

  return (
    <View style={styles.container}>
      {/* Messages using proven MessageList component - memoized to prevent input-related re-renders */}
      {React.useMemo(
        () => (
          <MessageList
            messages={messages}
            regeneratingIndex={regeneratingIndex}
            onRegenerate={regenerateMessage}
            onUserEditRegenerate={async (
              userIndex: number,
              newText: string
            ) => {
              await editUserAndRegenerate(userIndex, newText);
            }}
            showWelcomeText={messages.length === 0 && !loading}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ),
        [
          messages,
          loading,
          regeneratingIndex,
          regenerateMessage,
          editUserAndRegenerate,
          handleLike,
          handleDislike,
        ]
      )}
    </View>
  );
};

export default ChatInterface;
