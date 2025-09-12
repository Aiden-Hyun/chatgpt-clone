import { router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChat } from "@/entities/chatRoom";
import type { ChatMessage } from "@/entities/message";
import { useLogout } from "@/features/auth";
import {
  ChatHeader,
  ChatInputBar,
  MessageList,
  useModelSelection,
} from "@/features/chat";
import { AppTheme, useAppTheme } from "@/features/theme";
import { useBackButtonHandler, useInputFocus } from "@/shared/hooks";
import { navigationTracker } from "@/shared/lib/navigationTracker";
import { getLogger } from "@/shared/services/logger";

import { createChatStyles } from "./ChatScreen.styles";
const _logger = getLogger("ChatScreen");
// 💬 CONTEXT ISOLATION: Pure ChatScreen component that receives props instead of consuming contexts
interface ChatScreenProps {
  roomId?: string;
  isTemporaryRoom: boolean;
  numericRoomId: number | null;
  inputRef: React.RefObject<TextInput | null>;
  maintainFocus: () => void;
  disableBackButton: () => () => void;
  logout: () => void;
  // Pass-through model selection props from parent
  selectedModel?: string;
  onChangeModel?: (model: string) => void | Promise<void>;
  theme: AppTheme;
}

const ChatScreenPure = React.memo(
  (props: ChatScreenProps) => {
    const {
      roomId: _roomId,
      isTemporaryRoom: _isTemporaryRoom,
      numericRoomId,
      inputRef: _inputRef,
      maintainFocus: _maintainFocus,
      disableBackButton: _disableBackButton,
      selectedModel,
      onChangeModel,
      theme,
    } = props; // ✅ theme as prop
    const styles = createChatStyles(theme);

    // Direct chat hook usage (merged from ChatInterface)
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
    } = useChat(numericRoomId, { selectedModel, setModel: onChangeModel });

    // Create stable inputRef to prevent ChatInputBar re-renders
    const inputRef = useRef<TextInput | null>(null);

    // Like/dislike handlers (moved from ChatInterface)
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

    if (__DEV__) {
      // Pure component render counter
      if (!(global as { pureRenderCount?: number }).pureRenderCount)
        (global as { pureRenderCount?: number }).pureRenderCount = 0;
      (global as { pureRenderCount?: number }).pureRenderCount!++;
    }

    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={90}
        >
          {/* Messages using proven MessageList component (moved from ChatInterface) */}
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

          {/* ChatInputBar with direct state usage */}
          <ChatInputBar
            input={input}
            onChangeText={handleInputChange}
            onSend={sendMessage}
            sending={sending}
            isTyping={isTyping}
            inputRef={inputRef}
            isSearchMode={isSearchMode}
            onSearchToggle={onSearchToggle}
            selectedModel={selectedModel}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  },
  (prev, next) => {
    // Custom comparison: prevent re-render unless meaningful props actually change
    const primitiveEqual =
      prev.roomId === next.roomId &&
      prev.isTemporaryRoom === next.isTemporaryRoom &&
      prev.numericRoomId === next.numericRoomId;

    const functionsEqual =
      prev.logout === next.logout && prev.onChangeModel === next.onChangeModel;

    // Shallow compare individual props (allow different object wrapper if inner refs/functions unchanged)
    const inputRefEqual = prev.inputRef === next.inputRef;
    const maintainFocusEqual = prev.maintainFocus === next.maintainFocus;
    const disableBackButtonEqual =
      prev.disableBackButton === next.disableBackButton;
    const stateEqual =
      inputRefEqual && maintainFocusEqual && disableBackButtonEqual;

    // Re-render when selected model changes so ChatInterface sees updated model
    const modelEqual = prev.selectedModel === next.selectedModel;

    // ✅ Add theme comparison
    const themeEqual = prev.theme === next.theme;

    const equal =
      primitiveEqual &&
      functionsEqual &&
      stateEqual &&
      modelEqual &&
      themeEqual;

    return equal;
  }
);

ChatScreenPure.displayName = "ChatScreenPure";

// 🎯 CONTEXT CONSUMER WRAPPER: Consumes all contexts and passes props to pure component
const ChatScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();

  // Handle temporary room IDs - if roomId starts with 'temp_', treat it as a new room
  const isTemporaryRoom = roomId?.startsWith("temp_") ?? false;
  const numericRoomId = isTemporaryRoom
    ? null
    : roomId
    ? parseInt(roomId, 10)
    : null;

  // Add render counter for debugging
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  // 🎯 CONTEXT CONSUMPTION: All context/hook consumption happens here
  const inputFocus = useInputFocus();
  const backButton = useBackButtonHandler({ enabled: true });
  const { logout } = useLogout();
  const theme = useAppTheme(); // ✅ Move theme consumption to parent

  // State and refs
  // Parent owns per-room model via decoupled hook
  const { model: selectedModel, setModel: updateModel } =
    useModelSelection(numericRoomId);

  // 🎯 MEMOIZED PROPS: Only recreate when actual values change
  const chatScreenProps = React.useMemo(() => {
    return {
      roomId,
      isTemporaryRoom,
      numericRoomId,
      logout,
      theme, // ✅ Pass theme as prop
      selectedModel, // ✅ Include selectedModel in memoized props
      onChangeModel: updateModel, // ✅ Include onChangeModel in memoized props
      inputRef: inputFocus.inputRef,
      maintainFocus: inputFocus.maintainFocus,
      disableBackButton: backButton.disableBackButton,
    };
  }, [
    roomId,
    isTemporaryRoom,
    numericRoomId,
    logout,
    theme,
    selectedModel,
    updateModel,
    inputFocus.inputRef,
    inputFocus.maintainFocus,
    backButton.disableBackButton,
  ]);

  return (
    <>
      <ChatHeader
        onLogout={logout}
        onSettings={() => {
          const currentPath = `/chat/${roomId}`;
          navigationTracker.setPreviousRoute(currentPath);
          router.push("/settings");
        }}
        selectedModel={selectedModel}
        onModelChange={async (m: string) => {
          try {
            await updateModel(m);
          } catch {}
        }}
        showModelSelection
      />
      <ChatScreenPure {...chatScreenProps} />
    </>
  );
};

ChatScreen.displayName = "ChatScreen";

export { ChatScreen };
