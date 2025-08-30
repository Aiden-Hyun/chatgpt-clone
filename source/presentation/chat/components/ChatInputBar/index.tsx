import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ChatInputBarProps, getModelInfo } from '../../../interfaces/chat';
import { useLanguageContext } from '../../../language/LanguageContext';
import { useAppTheme } from '../../../theme/hooks/useTheme';

import { createChatInputStyles } from './ChatInputBar.styles';

/**
 * ChatInput - Native Responsive Multiline Input
 * Features:
 * - Sleek bubble-shaped input container
 * - Circular send button with proper Ionicons
 * - Clean design with no focus borders
 * - Smooth animations for state changes
 * - Native TextInput for proper iOS multiline behavior
 * - Responsive height that grows and shrinks with content
 * - Consistent behavior across iOS, Android, and Web
 */
const ChatInputBar: React.FC<ChatInputBarProps> = ({
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
  console.log('🔍 ChatInputBar: Starting render');
  
  const [inputHeight, setInputHeight] = useState(36);
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  
  console.log('🔍 ChatInputBar: Hooks result:', { t: !!t, theme: !!theme });
  
  // Check if the current model supports search
  const modelInfo = getModelInfo(selectedModel || 'gpt-3.5-turbo');
  const supportsSearch = modelInfo?.capabilities.search ?? false;
  
  // CRITICAL FIX: Memoize styles to prevent expensive re-creation
  const { styles } = useMemo(
    () => createChatInputStyles(theme),
    [theme]
  );

  const hasText = input.trim().length > 0;
  const MIN_INPUT_HEIGHT = 36;
  const MAX_INPUT_HEIGHT = 120;

  // Enable scrolling when content exceeds max height
  const shouldEnableScrolling = inputHeight >= MAX_INPUT_HEIGHT;

  // Custom send button icon component with dynamic states
  const SendButtonIcon = () => {
    if (sending) {
      return (
        <Ionicons 
          name="stop-outline" 
          size={20} 
          color={theme.colors.text.inverted} 
        />
      );
    }

    return (
      <Ionicons 
        name="send-outline" 
        size={20} 
        color={hasText ? theme.colors.text.inverted : theme.colors.primary} 
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Main input row */}
      <View style={[styles.inputRow, { height: Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, inputHeight)) }]}>
        {/* Bubble-shaped input container - Native TextInput */}
        <View style={[styles.inputBubble, { height: Math.max(MIN_INPUT_HEIGHT, Math.min(MAX_INPUT_HEIGHT, inputHeight)) }]}>
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={onChangeText}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={theme.colors.text.quaternary}
            multiline
            //numberOfLines={10}
            //scrollEnabled={shouldEnableScrolling}
            onContentSizeChange={(e) => {
              const nextHeight = e.nativeEvent.contentSize.height;
              setInputHeight(nextHeight);
            }}
            //blurOnSubmit={false}
            autoFocus
            editable={!sending}
            style={styles.input}
            textAlignVertical="top"
            // iOS-specific props for better multiline behavior
            {...(Platform.OS === 'ios' && {
              textAlignVertical: 'top',
              paddingTop: 8,
              paddingBottom: 8,
            })}
            // Web-specific props
            {...(Platform.OS === 'web' && {
              outlineWidth: 0,
              outlineColor: 'transparent',
              borderWidth: 0,
              boxShadow: 'none',
            })}
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
              <Ionicons 
                name="globe-outline" 
                size={20} 
                color={isSearchMode ? theme.colors.text.inverted : theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Native send button */}
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

export default ChatInputBar;