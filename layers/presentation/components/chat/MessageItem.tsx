// Clean presentation component - Pure message display with no business logic
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface MessageData {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  isAnimating?: boolean;
  error?: string;
}

interface MessageItemProps {
  message: MessageData;
  index: number;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
  onUserEdit?: (index: number, newText: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  theme: any; // Theme passed as prop
  translations: {
    regenerate?: string;
    like?: string;
    dislike?: string;
    retry?: string;
    edit?: string;
  };
}

/**
 * Pure message component - displays message content with actions
 * No dependencies on business logic or external services
 */
export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isRegenerating = false,
  onRegenerate,
  onUserEdit,
  onLike,
  onDislike,
  showAvatar = true,
  isLastInGroup = true,
  theme,
  translations
}) => {
  const styles = createMessageStyles(theme);

  // Loading state
  if (message.isLoading) {
    return <LoadingMessage theme={theme} />;
  }

  // Error state
  if (message.error) {
    return (
      <ErrorMessage 
        error={message.error}
        onRetry={onRegenerate}
        theme={theme}
        translations={translations}
      />
    );
  }

  // Render based on role
  switch (message.role) {
    case 'user':
      return (
        <UserMessage
          message={message}
          index={index}
          onEdit={onUserEdit}
          theme={theme}
          translations={translations}
        />
      );
    
    case 'assistant':
      return (
        <AssistantMessage
          message={message}
          isRegenerating={isRegenerating}
          onRegenerate={onRegenerate}
          onLike={onLike}
          onDislike={onDislike}
          theme={theme}
          translations={translations}
        />
      );
    
    case 'system':
      return (
        <SystemMessage
          message={message}
          theme={theme}
        />
      );
    
    default:
      return null;
  }
};

// Sub-components
const LoadingMessage: React.FC<{ theme: any }> = ({ theme }) => (
  <View style={createMessageStyles(theme).loadingContainer}>
    <Text style={createMessageStyles(theme).loadingText}>💭 Thinking...</Text>
  </View>
);

const ErrorMessage: React.FC<{
  error: string;
  onRetry?: () => void;
  theme: any;
  translations: any;
}> = ({ error, onRetry, theme, translations }) => {
  const styles = createMessageStyles(theme);
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>❌ {error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>
            {translations.retry || 'Retry'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const UserMessage: React.FC<{
  message: MessageData;
  index: number;
  onEdit?: (index: number, newText: string) => void;
  theme: any;
  translations: any;
}> = ({ message, index, onEdit, theme, translations }) => {
  const styles = createMessageStyles(theme);
  
  return (
    <View style={styles.userMessageContainer}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.content}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => onEdit(index, message.content)}
        >
          <Text style={styles.editText}>
            {translations.edit || 'Edit'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const AssistantMessage: React.FC<{
  message: MessageData;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  theme: any;
  translations: any;
}> = ({ message, isRegenerating, onRegenerate, onLike, onDislike, theme, translations }) => {
  const styles = createMessageStyles(theme);
  
  return (
    <View style={styles.assistantMessageContainer}>
      <View style={styles.assistantBubble}>
        <Text style={styles.assistantText}>{message.content}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        {onRegenerate && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRegenerate}
            disabled={isRegenerating}
          >
            <Text style={styles.actionText}>
              {isRegenerating ? '⏳' : '🔄'} {translations.regenerate || 'Regenerate'}
            </Text>
          </TouchableOpacity>
        )}
        
        {onLike && message.id && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onLike(message.id!)}
          >
            <Text style={styles.actionText}>
              👍 {translations.like || 'Like'}
            </Text>
          </TouchableOpacity>
        )}
        
        {onDislike && message.id && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDislike(message.id!)}
          >
            <Text style={styles.actionText}>
              👎 {translations.dislike || 'Dislike'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const SystemMessage: React.FC<{
  message: MessageData;
  theme: any;
}> = ({ message, theme }) => {
  const styles = createMessageStyles(theme);
  
  return (
    <View style={styles.systemMessageContainer}>
      <Text style={styles.systemText}>{message.content}</Text>
    </View>
  );
};

// Styles
const createMessageStyles = (theme: any) => ({
  // User message styles
  userMessageContainer: {
    alignItems: 'flex-end' as const,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    lineHeight: 22,
  },
  
  // Assistant message styles
  assistantMessageContainer: {
    alignItems: 'flex-start' as const,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  assistantText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  
  // System message styles
  systemMessageContainer: {
    alignItems: 'center' as const,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  systemText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
  
  // Loading styles
  loadingContainer: {
    alignItems: 'flex-start' as const,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic' as const,
  },
  
  // Error styles
  errorContainer: {
    alignItems: 'flex-start' as const,
    marginVertical: 4,
    marginHorizontal: 16,
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  
  // Action buttons
  actionButtons: {
    flexDirection: 'row' as const,
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.primaryText,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  
  editButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  }
});
