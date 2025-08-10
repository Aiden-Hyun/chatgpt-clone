import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { createChatStyles } from '../../../../../app/chat/chat.styles';
import { useChat } from '../../hooks';
import { ChatInput, MessageList } from '../index';

interface UnifiedChatProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  onModelChangeBridge?: (apply: (model: string) => Promise<void>, currentModel: string) => void;
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
  onModelChangeBridge,
}) => {
  // Get proven styles
  const styles = createChatStyles();
  
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
    selectedModel,
    updateModel,
  } = useChat(roomId || null);

  // Expose model change bridge for parent components
  React.useEffect(() => {
    if (!onModelChangeBridge) return;
    const apply = async (model: string) => {
      await updateModel(model);
    };
    onModelChangeBridge(apply, selectedModel);
  }, [onModelChangeBridge, updateModel, selectedModel]);

  // Convert regeneratingIndex to Set for MessageList compatibility
  const regeneratingIndices = new Set<number>();
  if (regeneratingIndex !== null) {
    regeneratingIndices.add(regeneratingIndex);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Messages using proven MessageList component - memoized to prevent input-related re-renders */}
      {React.useMemo(() => (
        <MessageList
          messages={messages}
          isNewMessageLoading={loading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content}
          regeneratingIndices={regeneratingIndices}
          onRegenerate={regenerateMessage}
          onUserEditRegenerate={async (userIndex: number, newText: string) => {
            // Simple edit implementation - could be enhanced later
            console.log('[EDIT] User edit not fully implemented yet', { userIndex, newTextLen: newText?.length });
          }}
          showWelcomeText={messages.length === 0 && !loading}
        />
      ), [messages, loading, regeneratingIndices, regenerateMessage])}

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
