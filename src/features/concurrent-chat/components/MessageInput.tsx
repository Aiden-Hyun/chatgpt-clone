import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * MessageInput - Handles message input and sending for concurrent chat
 * 
 * Features:
 * - Text input with placeholder
 * - Send button with loading state
 * - Keyboard handling
 * - Disabled state support
 * - Enter key support for sending
 * - Auto-focus on mount
 * - Concurrent message support (not blocked by sending state)
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  isSending = false,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Handle send button press
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
      // Keep focus on input for quick consecutive messages
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle enter key press
  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && value.trim() && !disabled) {
      handleSend();
    }
  };

  // Get send button style based on state
  const getSendButtonStyle = () => {
    const baseStyle = {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    if (!value.trim() || disabled) {
      return {
        ...baseStyle,
        backgroundColor: '#e9ecef',
      };
    }

    if (isSending) {
      return {
        ...baseStyle,
        backgroundColor: '#6c757d',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#007AFF',
    };
  };

  // Get send button text style
  const getSendButtonTextStyle = () => {
    const baseStyle = {
      fontSize: 14,
      fontWeight: '600',
    };

    if (!value.trim() || disabled) {
      return {
        ...baseStyle,
        color: '#6c757d',
      };
    }

    return {
      ...baseStyle,
      color: '#ffffff',
    };
  };

  // Get input style based on focus state
  const getInputStyle = () => {
    const baseStyle = {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      borderRadius: 8,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#dee2e6',
      color: '#333333',
    };

    if (isInputFocused) {
      return {
        ...baseStyle,
        borderColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      };
    }

    return baseStyle;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ backgroundColor: '#ffffff' }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        backgroundColor: '#ffffff',
      }}>
        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6c757d"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onKeyPress={handleKeyPress}
          multiline
          maxLength={2000}
          editable={!disabled}
          autoFocus
          returnKeyType="send"
          blurOnSubmit={false}
        />

        {/* Send button */}
        <TouchableOpacity
          style={getSendButtonStyle()}
          onPress={handleSend}
          disabled={!value.trim() || disabled}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={getSendButtonTextStyle()}>
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Character count */}
      {value.length > 0 && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          alignItems: 'flex-end',
        }}>
          <Text style={{
            fontSize: 12,
            color: value.length > 1800 ? '#dc3545' : '#6c757d',
          }}>
            {value.length}/2000
          </Text>
        </View>
      )}

      {/* Status indicator */}
      {isSending && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{
            fontSize: 12,
            color: '#6c757d',
            marginLeft: 8,
          }}>
            Sending message...
          </Text>
        </View>
      )}

      {disabled && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}>
          <Text style={{
            fontSize: 12,
            color: '#6c757d',
            fontStyle: 'italic',
          }}>
            Chat is temporarily disabled
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}; 