import React, { RefObject, useMemo, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { createChatInputStyles } from './ChatInput.styles';

interface ChatInputProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  isTyping?: boolean;
  inputRef: RefObject<TextInput | null>;
}

/**
 * ChatInput
 * Simple chat input component - reverted to basic implementation to fix re-render issues
 */
const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChangeText,
  onSend,
  sending,
  isTyping,
  inputRef,
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  
  // CRITICAL FIX: Memoize styles to prevent expensive re-creation
  const { styles, placeholderTextColor } = useMemo(
    () => createChatInputStyles(isInputFocused, theme),
    [isInputFocused, theme]
  );

  const hasText = input.trim().length > 0;
  const MAX_INPUT_HEIGHT = 120;

  return (
    <View style={styles.inputRow}>
      <TextInput
        ref={inputRef}
        style={isInputFocused ? [styles.input, styles.inputFocused, { height: Math.min(MAX_INPUT_HEIGHT, inputHeight) }] : [styles.input, { height: Math.min(MAX_INPUT_HEIGHT, inputHeight) }]}
        value={input}
        onChangeText={onChangeText}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={placeholderTextColor}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        multiline
        scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
        onContentSizeChange={(e) => {
          const nextHeight = e.nativeEvent.contentSize.height;
          setInputHeight(nextHeight);
        }}
        blurOnSubmit={false}
        autoFocus
        editable={true}
      />
      <TouchableOpacity
        style={hasText ? styles.sendButton : [styles.sendButton, styles.disabledButton]}
        onPress={() => {
          if (hasText) {
            onSend();
          }
        }}
        disabled={!hasText}
        activeOpacity={0.8}
      >
        <Text style={hasText ? styles.sendButtonText : [styles.sendButtonText, styles.disabledButtonText]}>
          {t('chat.send')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput; 