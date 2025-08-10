import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { useLanguageContext } from '../../../../features/language';
import { useAppTheme } from '../../../../shared/hooks';
import { ChatMessage } from '../../types';
import { generateMessageId } from '../../utils/messageIdGenerator';
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
  const [selectedWelcomeKey, setSelectedWelcomeKey] = useState('');
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  // Stable IDs for messages to ensure consistent FlatList keys
  const stableIdsRef = useRef<string[]>([]);
  const placeholderIdRef = useRef<string | null>(null);

  // Track indices that should animate once regeneration completes
  const [recentlyRegenerated, setRecentlyRegenerated] = useState<Set<number>>(new Set());
  const completedToClearRef = useRef<Set<number>>(new Set());
  const prevContentsRef = useRef<string[]>([]);
  const prevProcessingRef = useRef<Set<number>>(new Set());
  // Emit per-message animation triggers when regeneration completes
  const [animationTriggers, setAnimationTriggers] = useState<Map<number, string>>(new Map());

  // Array of welcome message keys
  const welcomeMessageKeys = useMemo(() => [
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
  ], []);

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
      // Only trigger animation if we don't already have one for this index
      if (becameNonEmpty && !animationTriggers.has(index)) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, regeneratingIndices, recentlyRegenerated]); // animationTriggers intentionally excluded to prevent infinite loop

  // Select random welcome message when component mounts or welcome text should be shown
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
      const randomKey = welcomeMessageKeys[Math.floor(Math.random() * welcomeMessageKeys.length)];
      setSelectedWelcomeKey(randomKey);
    }
  }, [messages.length, showWelcomeText, isNewMessageLoading, welcomeMessageKeys]);

  // Typewriter animation effect
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading && selectedWelcomeKey) {
      const welcomeMessage = t(selectedWelcomeKey);
      
      // Reset animation when welcome text should be shown
      setDisplayedText('');
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < welcomeMessage.length) {
          setDisplayedText(prevText => prevText + welcomeMessage[currentIndex]);
          currentIndex++;
        }
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

  // Ensure each message has a stable id. Prefer existing ids or _loadingId; otherwise generate once per index
  useEffect(() => {
    const ids = stableIdsRef.current;
    // Grow or shrink to match messages length
    if (messages.length < ids.length) {
      ids.length = messages.length;
    }
    for (let i = 0; i < messages.length; i++) {
      const explicitId = (messages[i] as any).id ?? (messages[i] as any)._loadingId;
      if (explicitId) {
        ids[i] = explicitId;
      } else if (!ids[i]) {
        ids[i] = generateMessageId();
      }
    }
  }, [messages]);

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

  // Prepare messages with stable ids for rendering
  const messagesWithIds = messages.map((m, i) => {
    const existingId = (m as any).id as string | undefined;
    const loadingId = (m as any)._loadingId as string | undefined;
    const resolvedId = existingId ?? loadingId ?? stableIdsRef.current[i];
    return { ...(m as any), id: resolvedId } as any;
  }) as ChatMessage[];

  // Add empty assistant message for new message loading, with a stable id
  const messagesWithLoading = isNewMessageLoading
    ? [
        ...messagesWithIds,
        {
          role: 'assistant' as const,
          content: '',
          id: (placeholderIdRef.current ||= generateMessageId()),
        } as any,
      ]
    : messagesWithIds;

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
    // Only animate for the newest assistant message or explicit regen completions
    const shouldAnimate = (!isHydrationMessage && isNewAssistantAtEnd) || wasRecentlyRegenerated;

    // Animation decision logging removed to prevent console spam

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
      keyExtractor={(item: any, index: number) => {
        const key = item.id || `fallback_${index}`;
        return key;
      }}
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