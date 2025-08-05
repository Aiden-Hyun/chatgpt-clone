import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { HoverDetector } from '../../../../features/ui';
import { LoadingMessage } from '../LoadingMessage';
import { MessageInteractionBar } from '../MessageInteractionBar';
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
        // Assistant message layout - Clean article style
        <View style={styles.assistantMessageContainer}>
          {isTyping && !item.content ? (
            <LoadingMessage />
          ) : (
            <>
              <Text style={[
                styles.messageText,
                styles.assistantMessageText,
              ]}>
                {item.content}
                {isTyping && (
                  <Animated.Text style={[styles.cursor, { opacity }]}>|</Animated.Text>
                )}
              </Text>
              
              {/* Interaction bar for AI messages */}
              {!isTyping && item.content && (
                <MessageInteractionBar
                  onRegenerate={onRegenerate}
                  onLike={() => console.log('Like pressed')}
                  onDislike={() => console.log('Dislike pressed')}
                  onShare={() => console.log('Share pressed')}
                  onCopy={() => console.log('Copy pressed')}
                  onAudio={() => console.log('Audio pressed')}
                />
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default ChatMessageBubble;
