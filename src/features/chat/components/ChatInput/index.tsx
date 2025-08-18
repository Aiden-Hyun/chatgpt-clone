import { Input } from '@/components/ui';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { RefObject, useMemo, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { getModelInfo } from '../../constants/models';
import { createChatInputStyles } from './ChatInput.styles';

interface ChatInputProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  isTyping?: boolean;
  inputRef: RefObject<any>;
  isSearchMode?: boolean;
  onSearchToggle?: () => void;
  selectedModel?: string;
}

/**
 * ChatInput - iOS Messages Style
 * Features:
 * - Sleek bubble-shaped input container
 * - Circular send button with proper MaterialIcons
 * - Clean iOS-like design with no focus borders
 * - Smooth animations for state changes
 */
const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChangeText,
  onSend,
  sending,
  isTyping,
  inputRef,
  isSearchMode = false,
  onSearchToggle,
  selectedModel,
}) => {
  const [inputHeight, setInputHeight] = useState(44);
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  
  // Check if the current model supports search
  const modelInfo = getModelInfo(selectedModel || 'gpt-3.5-turbo');
  const supportsSearch = modelInfo?.capabilities.search ?? false;
  
  // CRITICAL FIX: Memoize styles to prevent expensive re-creation
  const { styles } = useMemo(
    () => createChatInputStyles(theme),
    [theme]
  );

  const hasText = input.trim().length > 0;
  const MAX_INPUT_HEIGHT = 120;

  // Platform-specific scrolling logic
  const shouldEnableScrolling = Platform.OS === 'web' 
    ? inputHeight >= MAX_INPUT_HEIGHT 
    : true; // Always enable scrolling on mobile for multiline inputs

  // Platform-specific height calculation
  const inputHeightStyle = Platform.OS === 'web' 
    ? { height: Math.min(MAX_INPUT_HEIGHT, inputHeight) }
    : { minHeight: 36, maxHeight: MAX_INPUT_HEIGHT }; // Let content determine height on mobile

  // Custom send button icon component with dynamic states
  const SendButtonIcon = () => {
    if (sending) {
      // Stop icon for stop generation
      return (
        <MaterialIcons 
          name="stop" 
          size={20} 
          color={theme.colors.text.inverted} 
        />
      );
    }

    // Send icon for both states (inactive and active)
    return (
      <MaterialIcons 
        name="send" 
        size={20} 
        color={hasText ? theme.colors.text.inverted : theme.colors.primary} 
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Main input row */}
      <View style={styles.inputRow}>
        {/* Bubble-shaped input container - no focus styling */}
        <View style={styles.inputBubble}>
          <Input
            ref={inputRef}
            value={input}
            onChangeText={onChangeText}
            placeholder={t('chat.placeholder')}
            variant="chat"
            multiline
            scrollEnabled={shouldEnableScrolling}
            onContentSizeChange={(e) => {
              const nextHeight = e.nativeEvent.contentSize.height;
              setInputHeight(nextHeight);
            }}
            blurOnSubmit={false}
            autoFocus
            editable={!sending}
            containerStyle={styles.inputContainer}
            inputStyle={[
              styles.input,
              inputHeightStyle
            ]}
          />
        </View>

        {/* Search toggle button - only show if model supports search */}
        {onSearchToggle && supportsSearch && (
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity
              onPress={onSearchToggle}
              style={[
                styles.searchButton,
                isSearchMode && styles.searchButtonActive
              ]}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="search" 
                size={20} 
                color={isSearchMode ? theme.colors.text.inverted : theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* iOS-style send button */}
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              if (hasText && !sending) {
                onSend();
              }
            }}
            disabled={!hasText && !sending}
            style={[
              styles.sendButton,
              hasText && styles.sendButtonActive,
              sending && styles.sendButtonSending
            ]}
            activeOpacity={0.7}
          >
            <SendButtonIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional: Typing indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{t('chat.typing')}</Text>
        </View>
      )}
    </View>
  );
};

export default ChatInput; 