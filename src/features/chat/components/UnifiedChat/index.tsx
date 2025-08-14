import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { createChatStyles } from '../../../../../app/chat/chat.styles';
import { useAppTheme } from '../../../theme/theme';
import { useChat } from '../../hooks';
import ChatInput from '../ChatInput';
import MessageList from '../MessageList';

interface UnifiedChatProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  selectedModel?: string;
  onChangeModel?: (model: string) => void | Promise<void>;
}

/**
 * UnifiedChat - Simplified chat component that consolidates the best features
 * 
 * This component uses the proven chat system architecture while providing
 * a clean, unified interface. It's designed to replace both the original
 * chat components and the complex concurrent-chat system.
 * 
 * Features:
 * - Message sending and receiving
 * - Model selection
 * - Message regeneration
 * - Beautiful, proven UI
 * - Simplified state management
 */
export const UnifiedChat: React.FC<UnifiedChatProps> = ({
  roomId,
  initialModel = 'gpt-3.5-turbo',
  className,
  showHeader = true,
  selectedModel,
  onChangeModel,
}) => {

  // Get proven styles - memoized to prevent excessive re-renders
  const theme = useAppTheme();
  const styles = React.useMemo(() => createChatStyles(theme), [theme]);
  
  // Create stable inputRef to prevent ChatInput re-renders
  const inputRef = React.useRef<any>(null);
  

  
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
  } = useChat(roomId || null, { selectedModel, setModel: onChangeModel });
  

  // Pass primitive regeneratingIndex to MessageList for stability

  // Welcome text is controlled by MessageList based on messages.length === 0 && !loading

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Messages using proven MessageList component - memoized to prevent input-related re-renders */}
      {React.useMemo(() => (
        <MessageList
          messages={messages}
          regeneratingIndex={regeneratingIndex}
          onRegenerate={regenerateMessage}
          onUserEditRegenerate={async (userIndex: number, newText: string) => {
            await editUserAndRegenerate(userIndex, newText);
          }}
          showWelcomeText={messages.length === 0 && !loading}
        />
      ), [messages, loading, regeneratingIndex, regenerateMessage, editUserAndRegenerate])}

      {/* Input using proven ChatInput component */}
      <ChatInput
        input={input}
        onChangeText={handleInputChange}
        onSend={sendMessage}
        sending={sending}
        isTyping={isTyping}
        inputRef={inputRef}
      />
    </KeyboardAvoidingView>
  );
};

export default UnifiedChat;
