import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { HoverDetector } from '../../../../features/ui';
import { LoadingMessage } from '../LoadingMessage';
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
      {isUserMessage ? (
        // User message layout (unchanged)
        <HoverDetector
          style={[
            styles.messageBubble,
            styles.userBubble,
            !isLastInGroup && styles.bubbleCompact,
          ]}
          onHoverChange={() => {}}
        >
          <Text style={[
            styles.messageText,
            styles.userMessageText,
          ]}>
            {item.content}
          </Text>
        </HoverDetector>
      ) : (
        // Assistant message layout with avatar on top
        <View style={styles.assistantMessageContainer}>
          {showAvatar && (
            <View style={styles.avatarContainerTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AI</Text>
              </View>
            </View>
          )}
          <HoverDetector
            style={[
              styles.assistantMessageBubble,
              styles.assistantBubble,
              !isLastInGroup && styles.bubbleCompact,
              !showAvatar && styles.bubbleNoAvatar
            ]}
            onHoverChange={(isHovered) => {
              setShowRegenerateButton(isHovered);
            }}
          >
            {onRegenerate && (
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
            {isTyping && !item.content ? (
              <LoadingMessage />
            ) : (
              <Text style={[
                styles.messageText,
                styles.assistantMessageText,
              ]}>
                {item.content}
                {isTyping && (
                  <Animated.Text style={[styles.cursor, { opacity }]}>|</Animated.Text>
                )}
              </Text>
            )}
          </HoverDetector>
        </View>
      )}
    </View>
  );
};

export default ChatMessageBubble;
