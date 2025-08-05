import React from 'react';
import { View, Text } from 'react-native';
import { HoverDetector } from '../../../../features/ui';
import { ChatMessage } from '../../types';
import { createUserMessageStyles } from './UserMessage.styles';

interface UserMessageProps {
  message: ChatMessage;
  isLastInGroup?: boolean;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  isLastInGroup = true,
}) => {
  const styles = createUserMessageStyles();

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <HoverDetector
        style={[styles.bubble, !isLastInGroup && styles.bubbleCompact]}
        onHoverChange={() => {}}
      >
        <Text style={styles.text}>
          {message.content}
        </Text>
      </HoverDetector>
    </View>
  );
}; 