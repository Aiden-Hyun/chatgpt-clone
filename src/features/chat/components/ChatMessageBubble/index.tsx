import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { HoverDetector } from '../../../../shared/components/ui';
import { createChatMessageBubbleStyles } from './ChatMessageBubble.styles';

type ChatMessageProps = {
  item: {
    role: string;
    content: string;
  };
  isTyping?: boolean;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
};

const ChatMessageBubble = ({ item, isTyping = false, onRegenerate, showAvatar = true, isLastInGroup = true }: ChatMessageProps) => {
  // Create blinking cursor animation
  const [opacity] = useState(new Animated.Value(1));
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);
  const isUserMessage = item.role === 'user';
  
  // Get styles from dedicated style file
  const styles = createChatMessageBubbleStyles();
  
  useEffect(() => {
    if (isTyping) {
      // Create blinking animation sequence
      const blinkAnimation = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]);
      
      // Loop the animation
      Animated.loop(blinkAnimation).start();
      
      return () => {
        // Stop animation when component unmounts or isTyping changes
        opacity.stopAnimation();
      };
    }
  }, [isTyping]);
  
  return (
    <View style={[
      styles.messageRow, 
      isUserMessage ? styles.userMessageRow : styles.assistantMessageRow,
      !isLastInGroup && styles.messageRowCompact
    ]}>
      {!isUserMessage && showAvatar && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        </View>
      )}

      <HoverDetector
        style={[
          isUserMessage ? styles.messageBubble : styles.assistantMessageBubble,
          isUserMessage ? styles.userBubble : styles.assistantBubble,
          !isLastInGroup && styles.bubbleCompact,
          !showAvatar && !isUserMessage && styles.bubbleNoAvatar
        ]}
        onHoverChange={(isHovered) => {
          if (!isUserMessage) {
            setShowRegenerateButton(isHovered);
          }
        }}
      >
        {!isUserMessage && onRegenerate && (
          <TouchableOpacity 
            style={[
              styles.regenerateButton, 
              showRegenerateButton && styles.regenerateButtonVisible,
              isTyping && styles.disabledButton
            ]}
            onPress={onRegenerate}
            disabled={isTyping}
          >
            <Text style={styles.regenerateIcon}>↻</Text>
          </TouchableOpacity>
        )}
        <Text style={[
          styles.messageText,
          isUserMessage ? styles.userMessageText : styles.assistantMessageText,
        ]}>
          {item.content}
          {isTyping && !isUserMessage && (
            <Animated.Text style={[styles.cursor, { opacity }]}>|</Animated.Text>
          )}
        </Text>
      </HoverDetector>
    </View>
  );
};

export default ChatMessageBubble;
