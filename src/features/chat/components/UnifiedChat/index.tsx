import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { createChatStyles } from '../../../../../app/chat/chat.styles';
import { useAppTheme } from '../../../theme/lib/theme';
import { useChat } from '../../hooks';
import ChatInput from '../ChatInput';
import MessageList from '../MessageList';

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
  // FORENSIC MODE: Track ALL props that could cause UnifiedChat remounting
  if (__DEV__) {
    if (!(global as any).unifiedChatRenderCount) (global as any).unifiedChatRenderCount = 0;
    if (!(global as any).unifiedChatStartTime) (global as any).unifiedChatStartTime = performance.now();
    if (!(global as any).prevUnifiedChatProps) (global as any).prevUnifiedChatProps = {};
    
    const renderCount = ++((global as any).unifiedChatRenderCount);
    const timeSinceStart = Math.round(performance.now() - (global as any).unifiedChatStartTime);
    
    // Track ALL props that could cause remounting
    const currentProps = {
      roomId,
      roomIdType: typeof roomId,
      initialModel,
      showHeader,
      onModelChangeBridgeExists: !!onModelChangeBridge,
      onModelChangeBridgeIdentity: onModelChangeBridge?.toString?.().slice(0, 50) || 'none'
    };
    
    const prev = (global as any).prevUnifiedChatProps;
    const propChanges = {};
    
    for (const [key, value] of Object.entries(currentProps)) {
      if (prev[key] !== value) {
        propChanges[key] = `${prev[key]} → ${value}`;
      }
    }
    
    const hasChanges = Object.keys(propChanges).length > 0;
    const isFirstRender = renderCount === 1;
    
    console.log(`🏗️ [UnifiedChat-${renderCount}] +${timeSinceStart}ms ${isFirstRender ? 'MOUNT' : hasChanges ? 'REMOUNT' : 'RE-RENDER'}`, {
      renderType: isFirstRender ? 'MOUNT' : hasChanges ? 'REMOUNT (props changed)' : 'RE-RENDER (same props)',
      propChanges: hasChanges ? propChanges : 'No prop changes',
      currentProps,
      remountCause: hasChanges ? Object.keys(propChanges).join(', ') : 'Not props - check parent re-render'
    });
    
    (global as any).prevUnifiedChatProps = currentProps;
  }
  // Get proven styles - memoized to prevent excessive re-renders
  const theme = useAppTheme();
  const styles = React.useMemo(() => createChatStyles(theme), [theme]);
  
  // Create stable inputRef to prevent ChatInput re-renders
  const inputRef = React.useRef<any>(null);
  
  // FORENSIC MODE: Track component mounting vs re-rendering
  React.useEffect(() => {
    if (__DEV__) {
      const currentRender = (global as any).unifiedChatRenderCount || 0;
      console.log(`🔄 [UnifiedChat-${currentRender}] useEffect MOUNT detected - React created new component instance`);
    }
    
    return () => {
      if (__DEV__) {
        const currentRender = (global as any).unifiedChatRenderCount || 0;
        console.log(`💀 [UnifiedChat-${currentRender}] useEffect UNMOUNT detected - React destroying component instance`);
      }
    };
  }, []); // Empty dependency = only runs on mount/unmount

  // DETECTIVE MODE: Track the exact moment useChat is called
  if (__DEV__) {
    const currentUnifiedChatRender = (global as any).unifiedChatRenderCount || 0;
    console.log(`🎯 [UnifiedChat-${currentUnifiedChatRender}] About to call useChat(${roomId || null})`);
  }
  
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
          isNewMessageLoading={loading && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content}
          regeneratingIndices={regeneratingIndices}
          onRegenerate={regenerateMessage}
          onUserEditRegenerate={async (userIndex: number, newText: string) => {
            // Simple edit implementation - could be enhanced later
            if (__DEV__) { console.log('[EDIT] User edit not fully implemented yet', { userIndex, newTextLen: newText?.length }); }
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
