// Clean presentation screen - Pure UI that delegates to business layer
import React, { useRef, useState } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TextInput, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { MessageItem, MessageData } from '../components/chat/MessageItem';

interface ChatScreenProps {
  // Data
  messages: MessageData[];
  input: string;
  loading: boolean;
  sending: boolean;
  isTyping: boolean;
  selectedModel: string;
  isSearchMode: boolean;
  supportsSearch: boolean;
  
  // Actions
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onRegenerateMessage: (index: number) => void;
  onEditUserMessage: (index: number, newText: string) => void;
  onLikeMessage: (messageId: string) => void;
  onDislikeMessage: (messageId: string) => void;
  onSearchToggle: () => void;
  
  // UI Props
  theme: any;
  translations: {
    placeholder?: string;
    searchPlaceholder?: string;
    send?: string;
    regenerate?: string;
    like?: string;
    dislike?: string;
    retry?: string;
    edit?: string;
    emptyState?: string;
  };
  
  // Navigation
  onBack?: () => void;
  onSettings?: () => void;
  onNewChat?: () => void;
}

/**
 * Pure chat screen component - contains only UI logic
 * All business logic is handled by parent through props
 */
export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  input,
  loading,
  sending,
  isTyping,
  selectedModel,
  isSearchMode,
  supportsSearch,
  onInputChange,
  onSendMessage,
  onRegenerateMessage,
  onEditUserMessage,
  onLikeMessage,
  onDislikeMessage,
  onSearchToggle,
  theme,
  translations,
  onBack,
  onSettings,
  onNewChat
}) => {
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  
  const styles = createChatScreenStyles(theme);

  const handleRegenerate = (index: number) => {
    setRegeneratingIndex(index);
    onRegenerateMessage(index);
    // Note: Parent should clear regenerating state when complete
  };

  const handleSendMessage = () => {
    onSendMessage();
    // Auto-scroll to bottom when sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Messages list */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.length === 0 ? (
            <EmptyState theme={theme} message={translations.emptyState} />
          ) : (
            messages.map((message, index) => (
              <MessageItem
                key={message.id || index}
                message={message}
                index={index}
                isRegenerating={regeneratingIndex === index}
                onRegenerate={() => handleRegenerate(index)}
                onUserEdit={onEditUserMessage}
                onLike={onLikeMessage}
                onDislike={onDislikeMessage}
                theme={theme}
                translations={translations}
              />
            ))
          )}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <MessageItem
                message={{
                  role: 'assistant',
                  content: '',
                  isLoading: true
                }}
                index={-1}
                theme={theme}
                translations={translations}
              />
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <ChatInputBar
          input={input}
          onChangeText={onInputChange}
          onSend={handleSendMessage}
          sending={sending}
          isTyping={isTyping}
          inputRef={inputRef}
          isSearchMode={isSearchMode}
          onSearchToggle={onSearchToggle}
          selectedModel={selectedModel}
          supportsSearch={supportsSearch}
          theme={theme}
          translations={translations}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Empty state component
const EmptyState: React.FC<{ 
  theme: any; 
  message?: string; 
}> = ({ theme, message }) => {
  const styles = createChatScreenStyles(theme);
  
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContent}>
        <View style={styles.emptyStateIcon}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInner} />
          </View>
        </View>
        <View style={styles.emptyStateText}>
          {message || 'Start a conversation'}
        </View>
      </View>
    </View>
  );
};

// Styles
const createChatScreenStyles = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    paddingTop: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  emptyStateContent: {
    alignItems: 'center' as const,
    opacity: 0.6,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  iconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    opacity: 0.7,
  },
  emptyStateText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  }
});
