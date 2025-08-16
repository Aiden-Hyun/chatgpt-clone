import { Button, Input } from '@/components/ui';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import React, { RefObject, useMemo, useState } from 'react';
import { View } from 'react-native';
import { createChatInputStyles } from './ChatInput.styles';

interface ChatInputProps {
  input: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  isTyping?: boolean;
  inputRef: RefObject<any>;
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
  const { styles } = useMemo(
    () => createChatInputStyles(isInputFocused, theme),
    [isInputFocused, theme]
  );

  const hasText = input.trim().length > 0;
  const MAX_INPUT_HEIGHT = 120;

  return (
    <View style={styles.inputRow}>
      <Input
        value={input}
        onChangeText={onChangeText}
        placeholder={t('chat.placeholder')}
        variant="filled"
        multiline
        scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
        onContentSizeChange={(e) => {
          const nextHeight = e.nativeEvent.contentSize.height;
          setInputHeight(nextHeight);
        }}
        blurOnSubmit={false}
        autoFocus
        editable={true}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        containerStyle={styles.inputContainer}
        inputStyle={[
          styles.input,
          { height: Math.min(MAX_INPUT_HEIGHT, inputHeight) }
        ]}
      />
      <Button
        label={t('chat.send')}
        variant="primary"
        status="success"
        size="md"
        onPress={() => {
          if (hasText) {
            onSend();
          }
        }}
        disabled={!hasText}
        containerStyle={styles.sendButton}
      />
    </View>
  );
};

export default ChatInput; 