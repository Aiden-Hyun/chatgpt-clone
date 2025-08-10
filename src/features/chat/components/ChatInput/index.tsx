import React, { RefObject, useCallback, useMemo, useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useLanguageContext } from '../../../../features/language';
import { createChatInputStyles } from './ChatInput.styles';

interface ChatInputProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean; // ✅ Phase 2: Made optional - no longer used for blocking
  isTyping?: boolean; // ✅ Phase 2: Made optional - no longer used for blocking
  inputRef: RefObject<TextInput | null>;
}

/**
 * ChatInput
 * Handles message input and submission UI.
 * Optimized to prevent unnecessary re-renders on every keystroke.
 */
const ChatInput: React.FC<ChatInputProps> = React.memo(function ChatInput({
  input,
  onChangeText,
  onSend,
  sending,
  isTyping,
  inputRef,
}) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { t } = useLanguageContext();
  
  // Memoize styles to prevent recreation on every render
  const { styles, placeholderTextColor } = useMemo(
    () => createChatInputStyles(isInputFocused),
    [isInputFocused]
  );

  // Memoize computed values based on input state
  const hasText = useMemo(() => input.trim().length > 0, [input]);
  
  const sendButtonStyle = useMemo(() => {
    return hasText 
      ? styles.sendButton 
      : [styles.sendButton, styles.disabledButton];
  }, [styles.sendButton, styles.disabledButton, hasText]);

  const sendButtonTextStyle = useMemo(() => {
    return hasText 
      ? styles.sendButtonText 
      : [styles.sendButtonText, styles.disabledButtonText];
  }, [styles.sendButtonText, styles.disabledButtonText, hasText]);

  const inputStyle = useMemo(() => {
    return isInputFocused 
      ? [styles.input, styles.inputFocused] 
      : styles.input;
  }, [styles.input, styles.inputFocused, isInputFocused]);

  // Memoize event handlers to prevent recreation
  const handleFocus = useCallback(() => setIsInputFocused(true), []);
  const handleBlur = useCallback(() => setIsInputFocused(false), []);
  
  const handleKeyPress = useCallback(({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && input.trim()) {
      onSend();
    }
  }, [input, onSend]);

  const handleSendPress = useCallback(() => {
    if (hasText) {
      onSend();
    }
  }, [hasText, onSend]);

  return (
    <View style={styles.inputRow}>
      <TextInput
        ref={inputRef}
        style={inputStyle}
        value={input}
        onChangeText={onChangeText}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={placeholderTextColor}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        autoFocus
        editable={true}
      />
      <TouchableOpacity
        style={sendButtonStyle}
        onPress={handleSendPress}
        disabled={!hasText}
        activeOpacity={0.8}
      >
        <Text style={sendButtonTextStyle}>
          {t('chat.send')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default ChatInput; 