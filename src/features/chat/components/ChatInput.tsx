import React, { RefObject } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import {
  borderRadius,
  colors,
  fontFamily,
  fontSizes,
  fontWeights,
  letterSpacing,
  spacing,
  shadows,
} from '../../../shared/lib/theme';

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
}) => (
  <View style={styles.inputRow}>
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={input}
      onChangeText={onChangeText}
      placeholder="Type a message..."
      onKeyPress={({ nativeEvent }) => {
        if (nativeEvent.key === 'Enter' && !sending && input.trim()) {
          onSend();
        }
      }}
      autoFocus
      editable={!sending && !isTyping}
    />
    <TouchableOpacity
      style={[styles.sendButton, sending && styles.disabledButton]}
      onPress={onSend}
      disabled={sending}
    >
      <Text style={styles.sendButtonText}>{sending ? '...' : 'Send'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'flex-end',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.medium,
  },
  input: {
    flex: 1,
    borderColor: colors.border.medium,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    fontSize: fontSizes.md,
    backgroundColor: colors.background.primary,
    maxHeight: 120,
    minHeight: 44,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.normal,
  },
  sendButton: {
    backgroundColor: colors.button.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
  sendButtonText: {
    color: colors.button.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ChatInput;
