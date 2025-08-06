import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { useLanguageContext } from '../../../../features/language';
import { useAppTheme } from '../../../../shared/hooks';
import { ChatMessage } from '../../types';
import { MessageItem } from '../MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  isNewMessageLoading: boolean;
  regeneratingIndices: Set<number>;
  onRegenerate: (index: number) => void;
  showWelcomeText: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isNewMessageLoading,
  regeneratingIndices,
  onRegenerate,
  showWelcomeText,
}) => {
  // Add render counting for performance monitoring
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Log render count every 5 renders
  if (renderCount.current % 5 === 0) {
    console.log(`[RENDER-COUNT] MessageList: ${renderCount.current} renders`);
  }
  const flatListRef = useRef<FlatList>(null);
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWelcomeKey, setSelectedWelcomeKey] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Array of welcome message keys
  const welcomeMessageKeys = [
    'welcome.how_are_you',
    'welcome.whats_on_mind', 
    'welcome.how_can_help',
    'welcome.what_to_chat',
    'welcome.ready_to_help',
    'welcome.shall_we_explore',
    'welcome.create_amazing',
    'welcome.next_big_idea',
    'welcome.ready_adventure',
    'welcome.help_discover'
  ];

  const typingSpeed = 30; // milliseconds per character

  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      flexGrow: 1,
    },
    welcomeContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    welcomeText: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
      lineHeight: theme.fontSizes.xl * 1.4,
    },
    cursor: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.secondary,
      fontWeight: theme.fontWeights.medium as '500',
    },
  });

  // Select random welcome message when component mounts or welcome text should be shown
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
      const randomKey = welcomeMessageKeys[Math.floor(Math.random() * welcomeMessageKeys.length)];
      setSelectedWelcomeKey(randomKey);
    }
  }, [messages.length, showWelcomeText, isNewMessageLoading]);

  // Typewriter animation effect
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading && selectedWelcomeKey) {
      const welcomeMessage = t(selectedWelcomeKey);
      
      // Reset animation when welcome text should be shown
      setDisplayedText('');
      setCurrentIndex(0);
      
      const typeNextChar = () => {
        setCurrentIndex(prevIndex => {
          if (prevIndex < welcomeMessage.length) {
            setDisplayedText(prevText => prevText + welcomeMessage[prevIndex]);
            return prevIndex + 1;
          }
          return prevIndex;
        });
      };

      const interval = setInterval(typeNextChar, typingSpeed);
      return () => clearInterval(interval);
    }
  }, [messages.length, showWelcomeText, isNewMessageLoading, selectedWelcomeKey, t, typingSpeed]);

  // Blinking cursor animation
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      
      blinkAnimation.start();
      
      return () => blinkAnimation.stop();
    }
  }, [messages.length, showWelcomeText, isNewMessageLoading, cursorOpacity]);

  // Show welcome text if no messages and welcome text should be shown
  if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          {displayedText}
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
            |
          </Animated.Text>
        </Text>
      </View>
    );
  }

  // Add empty assistant message for new message loading
  const messagesWithLoading = isNewMessageLoading
    ? [...messages, { role: 'assistant' as const, content: '' }]
    : messages;

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isRegenerating = regeneratingIndices.has(index);
    
    // Group consecutive messages from the same sender
    const showAvatar =
      index === 0 || (index > 0 && messagesWithLoading[index - 1].role !== item.role);
    const isLastInGroup =
      index === messagesWithLoading.length - 1 ||
      (index < messagesWithLoading.length - 1 && messagesWithLoading[index + 1].role !== item.role);

    return (
      <MessageItem
        message={item}
        index={index}
        isNewMessageLoading={isNewMessageLoading && index === messages.length}
        isRegenerating={isRegenerating}
        onRegenerate={
          item.role === 'assistant' && !isRegenerating && !isNewMessageLoading
            ? () => onRegenerate(index)
            : undefined
        }
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  return (
    <FlatList
      data={messagesWithLoading}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderMessage}
      contentContainerStyle={styles.container}
      ref={flatListRef}
      extraData={[messages, isNewMessageLoading, regeneratingIndices]}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
      onLayout={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}; 