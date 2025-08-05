import React, { RefObject, useState } from 'react';
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
  sending: boolean;
  isTyping: boolean;
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { t } = useLanguageContext();
  
  // Get styles from dedicated style file
  const { styles, placeholderTextColor } = createChatInputStyles(isInputFocused);

  const getSendButtonStyle = () => {
    if (sending || isTyping || !input.trim()) {
      return [styles.sendButton, styles.disabledButton];
    }
    return styles.sendButton;
  };

  const getSendButtonTextStyle = () => {
    if (sending || isTyping || !input.trim()) {
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
          if (nativeEvent.key === 'Enter' && !sending && input.trim()) {
            onSend();
          }
        }}
        autoFocus
        editable={!sending && !isTyping}
      />
      <TouchableOpacity
        style={getSendButtonStyle()}
        onPress={onSend}
        disabled={sending || isTyping || !input.trim()}
        activeOpacity={0.8}
      >
        <Text style={getSendButtonTextStyle()}>
          {sending ? t('chat.sending') : t('chat.send')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput; 