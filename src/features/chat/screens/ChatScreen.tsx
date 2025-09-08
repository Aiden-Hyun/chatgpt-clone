import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLogout } from "@/features/auth";
import {
  ChatHeader,
  ChatInputBar,
  ChatInterface,
  useModelSelection,
} from "@/features/chat";
import { AppTheme, useAppTheme } from "@/features/theme";
import { useChatScreen } from "@/shared/hooks";
import { navigationTracker } from "@/shared/lib/navigationTracker";
import { getLogger } from "@/shared/services/logger";

import { createChatStyles } from "./ChatScreen.styles";
const _logger = getLogger("ChatScreen");
// 💬 CONTEXT ISOLATION: Pure ChatScreen component that receives props instead of consuming contexts
interface ChatScreenProps {
  roomId?: string;
  isTemporaryRoom: boolean;
  numericRoomId: number | null;
  chatScreenState: {
    inputRef: React.RefObject<TextInput>;
    maintainFocus: boolean;
    disableBackButton: boolean;
  };
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
      chatScreenState: _chatScreenState,
      selectedModel,
      onChangeModel,
      theme,
    } = props; // ✅ theme as prop
    const styles = createChatStyles(theme);

    // Chat state from ChatInterface
    const [chatState, setChatState] = useState<{
      input: string;
      handleInputChange: (text: string) => void;
      sendMessage: () => void;
      sending: boolean;
      isTyping: boolean;
      isSearchMode: boolean;
      onSearchToggle: () => void;
    } | null>(null);

    // Create stable inputRef to prevent ChatInputBar re-renders
    const inputRef = useRef<TextInput | null>(null);

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
          <ChatInterface
            roomId={numericRoomId ?? undefined}
            showHeader={false}
            selectedModel={selectedModel}
            onChangeModel={onChangeModel}
            onChatStateChange={setChatState}
          />

          {/* ChatInputBar moved to screen level for better layout control */}
          {chatState && (
            <ChatInputBar
              input={chatState.input}
              onChangeText={chatState.handleInputChange}
              onSend={chatState.sendMessage}
              sending={chatState.sending}
              isTyping={chatState.isTyping}
              inputRef={inputRef}
              isSearchMode={chatState.isSearchMode}
              onSearchToggle={chatState.onSearchToggle}
              selectedModel={selectedModel}
            />
          )}
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

    // Shallow compare chatScreenState contents (allow different object wrapper if inner refs/functions unchanged)
    const a = prev.chatScreenState;
    const b = next.chatScreenState;
    const stateEqual =
      a === b ||
      (a?.inputRef === b?.inputRef &&
        a?.maintainFocus === b?.maintainFocus &&
        a?.disableBackButton === b?.disableBackButton);

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
  const chatScreenState = useChatScreen();
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
      chatScreenState,
      logout,
      theme, // ✅ Pass theme as prop
      selectedModel, // ✅ Include selectedModel in memoized props
      onChangeModel: updateModel, // ✅ Include onChangeModel in memoized props
    };
  }, [
    roomId,
    isTemporaryRoom,
    numericRoomId,
    chatScreenState,
    logout,
    theme,
    selectedModel,
    updateModel,
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
        onBack={() => {
          try {
          } catch {}
        }}
        onChatSelect={(rid: string) => {
          try {
            if (rid && rid !== roomId) router.push(`/chat/${rid}`);
          } catch {}
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
