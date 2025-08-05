import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HoverDetector } from '../../../../features/ui';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onRegenerate,
  showAvatar = true,
  isLastInGroup = true,
}) => {
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);
  const styles = createAssistantMessageStyles();

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <Text style={styles.text}>
        {message.content}
      </Text>
      
      {/* Interaction bar for AI messages */}
      {message.content && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
          onLike={() => console.log('Like pressed')}
          onDislike={() => console.log('Dislike pressed')}
          onShare={() => console.log('Share pressed')}
          onCopy={() => console.log('Copy pressed')}
          onAudio={() => console.log('Audio pressed')}
        />
      )}
    </View>
  );
}; 