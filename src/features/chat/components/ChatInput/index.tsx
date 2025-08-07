import React, { RefObject, useRef, useState } from 'react';
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
 */
const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onChangeText,
  onSend,
  sending,
  isTyping,
  inputRef,
}) => {
  // Add render counting for performance monitoring
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Log render count every 5 renders (disabled for performance)
  // if (renderCount.current % 5 === 0) {
  //   console.log(`[RENDER-COUNT] ChatInput: ${renderCount.current} renders`);
  // }

  const [isInputFocused, setIsInputFocused] = useState(false);
  const { t } = useLanguageContext();
  
  // Get styles from dedicated style file
  const { styles, placeholderTextColor } = createChatInputStyles(isInputFocused);

  const getSendButtonStyle = () => {
    if (!input.trim()) {
      return [styles.sendButton, styles.disabledButton];
    }
    return styles.sendButton;
  };

  const getSendButtonTextStyle = () => {
    if (!input.trim()) {
      return [styles.sendButtonText, styles.disabledButtonText];
    }
    return styles.sendButtonText;
  };

  const getInputStyle = () => {
    if (isInputFocused) {
      return [styles.input, styles.inputFocused];
    }
    return styles.input;
  };

  return (
    <View style={styles.inputRow}>
      <TextInput
        ref={inputRef}
        style={getInputStyle()}
        value={input}
        onChangeText={onChangeText}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={placeholderTextColor}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === 'Enter' && input.trim()) {
            onSend();
          }
        }}
        autoFocus
        editable={true}
      />
      <TouchableOpacity
        style={getSendButtonStyle()}
        onPress={onSend}
        disabled={!input.trim()}
        activeOpacity={0.8}
      >
        <Text style={getSendButtonTextStyle()}>
          {t('chat.send')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput; 