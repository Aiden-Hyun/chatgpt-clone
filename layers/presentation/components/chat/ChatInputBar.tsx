// Clean presentation component - Pure UI with no business logic
import React, { RefObject, useMemo, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputBarProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  isTyping?: boolean;
  inputRef: RefObject<TextInput | null>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
  selectedModel?: string;
  supportsSearch?: boolean;
  placeholder?: string;
  theme: any; // Theme passed as prop instead of hook
  translations: {
    placeholder?: string;
    searchPlaceholder?: string;
    send?: string;
  };
}

/**
 * Pure chat input component - no dependencies on business logic or external services
 * All data and actions are passed as props
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  input,
  onChangeText,
  onSend,
  sending = false,
  isTyping = false,
  inputRef,
  isSearchMode = false,
  onSearchToggle,
  selectedModel,
  supportsSearch = false,
  placeholder,
  theme,
  translations
}) => {
  const [inputHeight, setInputHeight] = useState(36);
  
  const styles = useMemo(() => createChatInputStyles(theme), [theme]);
  
  const currentPlaceholder = placeholder || 
    (isSearchMode ? translations.searchPlaceholder : translations.placeholder) ||
    (isSearchMode ? 'Search with AI...' : 'Type a message...');

  const handleSend = () => {
    if (input.trim() && !sending && !isTyping) {
      onSend();
    }
  };

  const handleContentSizeChange = (event: any) => {
    const newHeight = Math.max(36, Math.min(120, event.nativeEvent.contentSize.height));
    setInputHeight(newHeight);
  };

  const canSend = input.trim().length > 0 && !sending && !isTyping;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { minHeight: inputHeight + 16 }]}>
        {/* Search toggle button */}
        {supportsSearch && onSearchToggle && (
          <TouchableOpacity
            style={[styles.searchButton, isSearchMode && styles.searchButtonActive]}
            onPress={onSearchToggle}
            accessibilityLabel={isSearchMode ? "Switch to chat mode" : "Switch to search mode"}
          >
            <Text style={[styles.searchIcon, isSearchMode && styles.searchIconActive]}>
              🔍
            </Text>
          </TouchableOpacity>
        )}

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { height: inputHeight }]}
          value={input}
          onChangeText={onChangeText}
          placeholder={currentPlaceholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          onContentSizeChange={handleContentSizeChange}
          returnKeyType="default"
          blurOnSubmit={false}
          textAlignVertical="top"
          accessibilityLabel="Message input"
        />

        {/* Send button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel={translations.send || "Send message"}
        >
          <Text style={[
            styles.sendIcon,
            canSend ? styles.sendIconActive : styles.sendIconDisabled
          ]}>
            {sending ? '⏳' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Model indicator */}
      {selectedModel && (
        <View style={styles.modelIndicator}>
          <Text style={styles.modelText}>
            {isSearchMode ? '🔍 ' : '💬 '}{selectedModel}
          </Text>
        </View>
      )}
    </View>
  );
};

// Styles function (would normally be in a separate file)
const createChatInputStyles = (theme: any) => ({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 8,
    backgroundColor: theme.colors.background,
  },
  searchButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  searchIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  searchIconActive: {
    color: theme.colors.primaryText,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
    maxHeight: 120,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  sendIcon: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  sendIconActive: {
    color: theme.colors.primaryText,
  },
  sendIconDisabled: {
    color: theme.colors.textSecondary,
  },
  modelIndicator: {
    alignSelf: 'flex-start' as const,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  modelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500' as const,
  }
});
