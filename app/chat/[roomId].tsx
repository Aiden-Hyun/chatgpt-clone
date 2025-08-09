// Moved Picker inside ChatHeader component
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLogout } from '../../src/features/auth';
import { ChatHeader } from '../../src/features/chat/components';
import { useChatRooms } from '../../src/features/chat/hooks';
import { ConcurrentChat } from '../../src/features/concurrent-chat';
import { LoadingWrapper } from '../../src/features/ui';
import { useBackButtonHandler, useInputFocus } from '../../src/shared/hooks';
import { createChatStyles } from './chat.styles';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  
  // Handle temporary room IDs - if roomId starts with 'temp_', treat it as a new room
  const isTemporaryRoom = roomId?.startsWith('temp_');
  const numericRoomId = isTemporaryRoom ? null : (roomId ? parseInt(roomId, 10) : null);
  try { console.log('[NAV] route', { roomId, isTemporaryRoom, numericRoomId }); } catch {}
  
  const { inputRef, maintainFocus } = useInputFocus();
  const { disableBackButton } = useBackButtonHandler({ enabled: true });
  const { startNewChat } = useChatRooms();
  const styles = createChatStyles();
  const modelApplyRef = React.useRef<((m: string) => Promise<void>) | null>(null);
  const [currentModel, setCurrentModel] = React.useState<string>('gpt-3.5-turbo');

  // Track if user has started typing to hide welcome text
  const [hasUserTyped, setHasUserTyped] = React.useState(false);

  const loading = false;
  const { logout } = useLogout();
  
  // No longer need local input/message wiring; ConcurrentChat handles it.

  const handleNewChat = () => {
    startNewChat();
  };

  const handleChatSelect = (selectedRoomId: string) => {
    try { console.log('[NAV] select', selectedRoomId); } catch {}
    router.push({ pathname: '/chat/[roomId]', params: { roomId: selectedRoomId } });
  };

  const handleBack = () => {
    router.push('/');
  };

  // Back button is automatically disabled by useBackButtonHandler hook

  return (
    <LoadingWrapper loading={loading}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ChatHeader
          onLogout={logout}
          onSettings={() => router.push('/settings')}
          onBack={handleBack}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          selectedChatId={roomId}
          selectedModel={currentModel}
          onModelChange={async (model) => {
            console.log('[MODEL] header selected', model);
            setCurrentModel(model);
            if (modelApplyRef.current) {
              try { await modelApplyRef.current(model); } catch {}
            }
          }}
          showModelSelection
        />
        <ConcurrentChat 
          roomId={numericRoomId ?? undefined} 
          showHeader={false}
          onModelChangeBridge={(apply, model) => { modelApplyRef.current = apply; setCurrentModel(model); }}
        />
      </KeyboardAvoidingView>
    </LoadingWrapper>
  );
} 