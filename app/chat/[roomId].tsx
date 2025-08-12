import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLogout } from '../../src/features/auth';
import { ChatHeader, UnifiedChat } from '../../src/features/chat/components';
import { LoadingWrapper } from '../../src/features/ui';
import { useChatScreen } from '../../src/shared/hooks';

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
    styles: any;
  };
  onModelChangeBridge: (apply: any, model: any) => void;
  logout: () => void;
}

const ChatScreenPure = React.memo((props: ChatScreenProps) => {
  const { roomId, isTemporaryRoom, numericRoomId, chatScreenState, onModelChangeBridge, logout } = props;
  const { startNewChat, styles } = chatScreenState;
  
  // Local ref for model apply - this is component-specific state
  const modelApplyRef = React.useRef<((m: string) => Promise<void>) | null>(null);
  
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

  // Simple event handlers for the pure component
  const handleNewChat = () => {
    startNewChat();
  };

  const handleChatSelect = (selectedRoomId: string) => {
    try { 
      console.log('🚀 [NAV] Chat selection received', { 
        selectedRoomId, 
        currentRoomId: roomId,
        selectedRoomIdType: typeof selectedRoomId,
        timestamp: new Date().toISOString() 
      });
      
      // Don't navigate to the same room
      if (selectedRoomId === roomId) {
        console.log('⏹️ [NAV] Already in room, skipping navigation', selectedRoomId);
        return;
      }
      
      // Navigate to the selected room
      console.log('🎯 [NAV] Navigating to room', selectedRoomId);
      router.push(`/chat/${selectedRoomId}`);
      
      console.log('✅ [NAV] Navigation command sent', selectedRoomId);
    } catch (error) {
      console.error('❌ [NAV] Navigation error', error);
    }
  };

  const handleBack = () => {
    try { console.log('[NAV] back'); } catch {}
  };

  const loading = false;

  return (
    <LoadingWrapper loading={loading}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ChatHeader
          onLogout={logout}
          onSettings={() => { router.push('/settings'); }}
          onBack={handleBack}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onModelChange={async (model: string) => {
            if (modelApplyRef.current) {
              try { await modelApplyRef.current(model); } catch {}
            }
          }}
          showModelSelection
        />
        {/* 🎯 FIXED: onModelChangeBridge now memoized to prevent unnecessary remounting */}
        
        <UnifiedChat 
          roomId={numericRoomId ?? undefined} 
          showHeader={false}
          onModelChangeBridge={onModelChangeBridge}
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
    prev.onModelChangeBridge === next.onModelChangeBridge &&
    prev.logout === next.logout;

  // Shallow compare chatScreenState contents (allow different object wrapper if inner refs/functions unchanged)
  const a = prev.chatScreenState;
  const b = next.chatScreenState;
  const stateEqual =
    a === b || (
      a?.inputRef === b?.inputRef &&
      a?.maintainFocus === b?.maintainFocus &&
      a?.disableBackButton === b?.disableBackButton &&
      a?.startNewChat === b?.startNewChat &&
      a?.theme === b?.theme &&
      a?.styles === b?.styles
    );

  const equal = primitiveEqual && functionsEqual && stateEqual;



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
  const modelApplyRef = React.useRef<((m: string) => Promise<void>) | null>(null);
  
  // 🎯 MEMOIZED CALLBACK: Stable function reference
  const onModelChangeBridge = React.useCallback((apply: any, model: any) => {
    if (__DEV__) {
      console.log(`🔧 [FIX] onModelChangeBridge STABLE function called`, {
        note: "This function is now memoized - should prevent remounting!"
      });
    }
    modelApplyRef.current = apply; 
  }, []); // Empty deps = stable across all renders

  // 🎯 MEMOIZED PROPS: Only recreate when actual values change
  const chatScreenProps = React.useMemo(() => ({
    roomId,
    isTemporaryRoom,
    numericRoomId,
    chatScreenState,
    onModelChangeBridge,
    logout,
  }), [roomId, isTemporaryRoom, numericRoomId, chatScreenState, onModelChangeBridge, logout]);



  return <ChatScreenPure {...chatScreenProps} />;
};

ChatScreen.displayName = 'ChatScreen';

export default ChatScreen;