import { LoadingWrapper } from '@/components';
import { useLogout } from '@/features/auth';
import { ChatHeader, UnifiedChat } from '@/features/chat/components';
import { useAppTheme } from '@/features/theme/theme';
import { useChatScreen } from '@/shared/hooks';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRoomModel } from '../../src/features/chat/model/useRoomModel';
import { createChatStyles } from './chat.styles';

// 🎯 CONTEXT ISOLATION: Pure ChatScreen component that receives props instead of consuming contexts
interface ChatScreenProps {
  roomId?: string;
  isTemporaryRoom: boolean;
  numericRoomId: number | null;
  chatScreenState: {
    inputRef: any;
    maintainFocus: any;
    disableBackButton: any;
    startNewChat: () => void;
    theme: any;
  };
  logout: () => void;
  // Pass-through model selection props from parent
  selectedModel?: string;
  onChangeModel?: (model: string) => void | Promise<void>;
}

const ChatScreenPure = React.memo((props: ChatScreenProps) => {
  const { roomId, isTemporaryRoom, numericRoomId, chatScreenState, selectedModel, onChangeModel } = props;
  const theme = useAppTheme();
  const styles = createChatStyles(theme);
  
  // No model bridge ref needed; parent owns model selection
  
  if (__DEV__) {
    // Pure component render counter
    if (!(global as any).pureRenderCount) (global as any).pureRenderCount = 0;
    (global as any).pureRenderCount++;
    
    console.log(`🎯 [PURE-COUNT] Pure Component Render #${(global as any).pureRenderCount}`, {
      roomId,
      isTemporaryRoom,
      numericRoomId,
      note: 'This component should only re-render when props actually change'
    });
  }

  // Header is rendered by the parent wrapper to avoid duplication

  const loading = false;

  return (
    <LoadingWrapper loading={loading}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <UnifiedChat 
          roomId={numericRoomId ?? undefined} 
          showHeader={false}
          selectedModel={selectedModel}
          onChangeModel={onChangeModel}
        />
      </KeyboardAvoidingView>
    </LoadingWrapper>
  );
}, (prev, next) => {
  // Custom comparison: prevent re-render unless meaningful props actually change
  const primitiveEqual =
    prev.roomId === next.roomId &&
    prev.isTemporaryRoom === next.isTemporaryRoom &&
    prev.numericRoomId === next.numericRoomId;

  const functionsEqual =
    prev.logout === next.logout &&
    prev.onChangeModel === next.onChangeModel;

  // Shallow compare chatScreenState contents (allow different object wrapper if inner refs/functions unchanged)
  const a = prev.chatScreenState;
  const b = next.chatScreenState;
  const stateEqual =
    a === b || (
      a?.inputRef === b?.inputRef &&
      a?.maintainFocus === b?.maintainFocus &&
      a?.disableBackButton === b?.disableBackButton &&
      a?.startNewChat === b?.startNewChat &&
      a?.theme === b?.theme
    );

  // Re-render when selected model changes so UnifiedChat sees updated model
  const modelEqual = prev.selectedModel === next.selectedModel;

  const equal = primitiveEqual && functionsEqual && stateEqual && modelEqual;



  return equal;
});

ChatScreenPure.displayName = 'ChatScreenPure';

// 🎯 CONTEXT CONSUMER WRAPPER: Consumes all contexts and passes props to pure component
const ChatScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  
  // Handle temporary room IDs - if roomId starts with 'temp_', treat it as a new room
  const isTemporaryRoom = roomId?.startsWith('temp_') ?? false;
  const numericRoomId = isTemporaryRoom ? null : (roomId ? parseInt(roomId, 10) : null);
  
  if (__DEV__) {
    console.log('🏠 [CHAT-SCREEN] Route params changed', {
      roomId,
      isTemporaryRoom,
      numericRoomId,
      timestamp: new Date().toISOString()
    });
  }
  
  // 🎯 CONTEXT CONSUMPTION: All context/hook consumption happens here
  const chatScreenState = useChatScreen();
  const { logout } = useLogout();
  
  // State and refs
  // Parent owns per-room model via decoupled hook
  const { model: selectedModel, setModel: updateModel } = useRoomModel(numericRoomId);

  // 🎯 MEMOIZED PROPS: Only recreate when actual values change
  const chatScreenProps = React.useMemo(() => ({
    roomId,
    isTemporaryRoom,
    numericRoomId,
    chatScreenState,
    logout,
  }), [roomId, isTemporaryRoom, numericRoomId, chatScreenState, logout]);



  return (
    <>
      <ChatHeader
        onLogout={logout}
        onSettings={() => { router.push('/settings'); }}
        onBack={() => { try { console.log('[NAV] back'); } catch {} }}
        onNewChat={chatScreenState.startNewChat}
        onChatSelect={(rid: string) => {
          try {
            if (rid && rid !== roomId) router.push(`/chat/${rid}`);
          } catch {}
        }}
        selectedModel={selectedModel}
        onModelChange={async (m: string) => { try { await updateModel(m); } catch {} }}
        showModelSelection
      />
      <ChatScreenPure 
        {...chatScreenProps}
        selectedModel={selectedModel}
        onChangeModel={updateModel}
      />
    </>
  );
};

ChatScreen.displayName = 'ChatScreen';

export default ChatScreen;