import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogout } from '../../auth/hooks/useLogout';
import { ChatHeader, ChatInputBar, ChatInterface } from '../../chat/components';
import { useModelSelection } from '../../chat/hooks/useModelSelection';
import { useAppTheme } from '../../theme/hooks/useTheme';
import { createChatStyles } from './chat.styles';


// �� CONTEXT ISOLATION: Pure ChatScreen component that receives props instead of consuming contexts
interface ChatScreenProps {
  roomId?: string;
  isTemporaryRoom: boolean;
  numericRoomId: number | null;
  chatScreenState: {
    inputRef: any;
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSendMessage: () => void;
    isLoading: boolean;
    selectedModel: string;
    handleModelChange: (model: string) => void;
    handleLogout: () => void;
    handleBack: () => void;
  };
}

function ChatScreen({
  roomId,
  isTemporaryRoom,
  numericRoomId,
  chatScreenState,
}: ChatScreenProps) {
  const theme = useAppTheme();
  const styles = createChatStyles(theme);

  const {
    inputRef,
    inputValue,
    setInputValue,
    handleSendMessage,
    isLoading,
    selectedModel,
    handleModelChange,
    handleLogout,
    handleBack,
  } = chatScreenState;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ChatHeader
          title={isTemporaryRoom ? 'New Chat' : `Chat #${roomId}`}
          onBack={handleBack}
          onLogout={handleLogout}
          showBackButton={true}
        />

        {numericRoomId !== null && (
          <ChatInterface
            roomId={numericRoomId}
            key={`chat-interface-${numericRoomId}`}
          />
        )}

        <ChatInputBar
          ref={inputRef}
          value={inputValue}
          onChangeText={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function ChatRoomScreen() {
  // �� CONTAINER COMPONENT: Handles data fetching, state, and context
  const params = useLocalSearchParams<{ roomId: string }>();
  const roomId = params.roomId;
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState('');
  const { selectedModel, handleModelChange } = useModelSelection();
  const [isLoading, setIsLoading] = useState(false);
  const logout = useLogout();

  // Determine if this is a temporary room (new chat)
  const isTemporaryRoom = roomId === 'new';
  
  // Convert string roomId to number for API calls
  // For temporary rooms, we'll create a room when sending the first message
  const numericRoomId = isTemporaryRoom ? null : parseInt(roomId || '0', 10);

  // Focus input when component mounts
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    
    // This would normally call an API to send the message
    // For now, we'll just simulate it
    setIsLoading(true);
    console.log('Sending message:', inputValue, 'to room:', roomId);
    console.log('Using model:', selectedModel);
    
    // Clear input after sending
    setInputValue('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle navigation back to chat list
  const handleBack = () => {
    router.back();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Prepare state to pass to presentational component
  const chatScreenState = {
    inputRef,
    inputValue,
    setInputValue,
    handleSendMessage,
    isLoading,
    selectedModel,
    handleModelChange,
    handleLogout,
    handleBack,
  };

  return (
    <ChatScreen
      roomId={roomId}
      isTemporaryRoom={isTemporaryRoom}
      numericRoomId={numericRoomId}
      chatScreenState={chatScreenState}
    />
  );
}