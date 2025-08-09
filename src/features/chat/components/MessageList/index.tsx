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
  onUserEditRegenerate?: (index: number, newText: string) => void;
  showWelcomeText: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isNewMessageLoading,
  regeneratingIndices,
  onRegenerate,
  onUserEditRegenerate,
  showWelcomeText,
}) => {
  // Add render counting for performance monitoring
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Log render count every 5 renders (disabled for performance)
  // if (renderCount.current % 5 === 0) {
  //   console.log(`[RENDER-COUNT] MessageList: ${renderCount.current} renders`);
  // }
  const flatListRef = useRef<FlatList>(null);
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWelcomeKey, setSelectedWelcomeKey] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Track indices that should animate once regeneration completes
  const [recentlyRegenerated, setRecentlyRegenerated] = useState<Set<number>>(new Set());
  const completedToClearRef = useRef<Set<number>>(new Set());
  const prevContentsRef = useRef<string[]>([]);
  const prevProcessingRef = useRef<Set<number>>(new Set());
  // Emit per-message animation triggers when regeneration completes
  const [animationTriggers, setAnimationTriggers] = useState<Map<number, string>>(new Map());

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

  // Capture the initial hydrated message count to suppress animation for preloaded history
  const initialHydratedLengthRef = useRef<number | null>(null);
  useEffect(() => {
    if (initialHydratedLengthRef.current === null && messages.length > 0) {
      initialHydratedLengthRef.current = messages.length;
      try { console.log('[ANIM] initCount', initialHydratedLengthRef.current); } catch {}
    }
  }, [messages.length]);

  // Detect regeneration completion and processing→completed transition (for live replies)
  useEffect(() => {
    const prevContents = prevContentsRef.current;
    const nextContents = messages.map(m => m.content);

    // Detect assistant reply completion (processing→completed)
    const finishedProcessing: number[] = [];
    prevProcessingRef.current.forEach((idx) => {
      if (!regeneratingIndices.has(idx)) {
        finishedProcessing.push(idx);
      }
    });
    finishedProcessing.forEach(index => {
      const becameNonEmpty = (prevContents[index] ?? '') === '' && (nextContents[index] ?? '').length > 0;
      if (becameNonEmpty) {
        setAnimationTriggers(prev => {
          const copy = new Map(prev);
          const token = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          copy.set(index, token);
          return copy;
        });
        try { console.log('[ANIM] reply-complete', index); } catch {}
      }
    });

    recentlyRegenerated.forEach(index => {
      const isRegen = regeneratingIndices.has(index);
      const contentChanged = nextContents[index] !== prevContents[index];
      if (!isRegen && contentChanged) {
        // regen completed
        // Fire a one-shot animation trigger for this index
        setAnimationTriggers(prev => {
          const copy = new Map(prev);
          const token = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          copy.set(index, token);
          // animation trigger
          return copy;
        });
        try { console.log('[ANIM] regen-complete', index); } catch {}
        // Keep the flag for one more render, then clear in next cycle
        completedToClearRef.current.add(index);
      }
    });

    // Clear any indices that were marked in the previous cycle
    if (completedToClearRef.current.size > 0) {
      setRecentlyRegenerated(prev => {
        const copy = new Set(prev);
        completedToClearRef.current.forEach(i => copy.delete(i));
        // clear recently regenerated markers
        return copy;
      });
      completedToClearRef.current.clear();
    }

    prevContentsRef.current = nextContents;
    prevProcessingRef.current = new Set(regeneratingIndices);
  }, [messages, regeneratingIndices, recentlyRegenerated]);

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

  // Show welcome text only when truly idle (not during hydration/loading)
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
    const wasRecentlyRegenerated = recentlyRegenerated.has(index);
    const triggerToken = animationTriggers.get(index);
    
    // Group consecutive messages from the same sender
    const showAvatar =
      index === 0 || (index > 0 && messagesWithLoading[index - 1].role !== item.role);
    const isLastInGroup =
      index === messagesWithLoading.length - 1 ||
      (index < messagesWithLoading.length - 1 && messagesWithLoading[index + 1].role !== item.role);

    // Determine if this message should animate
    // Suppress animation for any message that was part of the initial hydration.
    const initialCount = initialHydratedLengthRef.current ?? messages.length;
    const isHydrationMessage = initialHydratedLengthRef.current !== null && index < initialCount;
    const isNewAssistantAtEnd = item.role === 'assistant' && index === messagesWithLoading.length - 1 && messagesWithLoading.length > initialCount;
    const shouldAnimate = (!isHydrationMessage && isNewAssistantAtEnd) || isRegenerating || wasRecentlyRegenerated;

    if (index === messagesWithLoading.length - 1 && item.role === 'assistant') {
      try { console.log('[ANIM] decide', { init: initialCount, len: messagesWithLoading.length, hyd: isHydrationMessage, regen: isRegenerating || wasRecentlyRegenerated, animate: shouldAnimate }); } catch {}
    }

    const handleRegenerate = () => {
      // Mark this index to animate when regeneration completes
      setRecentlyRegenerated(prev => new Set(prev).add(index));
      onRegenerate(index);
    };

    return (
      <MessageItem
        message={item}
        index={index}
        isNewMessageLoading={isNewMessageLoading && index === messages.length}
        isRegenerating={isRegenerating}
        animationTrigger={triggerToken}
        onRegenerate={
          item.role === 'assistant' && !isRegenerating && !isNewMessageLoading
            ? handleRegenerate
            : undefined
        }
        onUserEditRegenerate={onUserEditRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
        shouldAnimate={shouldAnimate}
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
      extraData={[messages, isNewMessageLoading, regeneratingIndices, recentlyRegenerated, animationTriggers]}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
      onLayout={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}; 