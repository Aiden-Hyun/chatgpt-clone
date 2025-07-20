import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows, fontWeights } from '../../../../shared/lib/theme';

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  messageRowCompact: {
    marginVertical: spacing.xxs,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    maxWidth: '70%',
    minWidth: 40,
    ...shadows.light,
  },
  bubbleCompact: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  bubbleNoAvatar: {
    marginLeft: 36,
  },
  userBubble: {
    backgroundColor: colors.message.user,
    borderTopRightRadius: borderRadius.xs,
    marginLeft: 40,
  },
  assistantBubble: {
    backgroundColor: colors.message.assistant,
    borderTopLeftRadius: borderRadius.xs,
    marginRight: 40,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.avatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold as '600',
    color: colors.text.tertiary,
  },
  messageText: {
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.message.userText,
  },
  assistantMessageText: {
    color: colors.message.assistantText,
  },
  regenerateButton: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    zIndex: 1,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5, // Slightly visible by default
  },
  regenerateButtonVisible: {
    opacity: 1, // Fully visible when hovered
  },
  disabledButton: {
    opacity: 0.5,
  },
  regenerateIcon: {
    fontSize: fontSizes.xs,
    color: '#bbb',
    lineHeight: fontSizes.xs,
  },
  cursor: {
    color: colors.text.primary,
  },
});
import { HoverDetector } from '../../../../shared/components/ui';

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
          styles.messageBubble,
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
