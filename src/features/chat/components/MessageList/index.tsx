import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { useLanguageContext } from '../../../../features/language';
import { useAppTheme } from '../../../theme/lib/theme';
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

  // Simplified state tracking for regeneration
  const [recentlyRegenerated, setRecentlyRegenerated] = useState<Set<number>>(new Set());

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

  // Memoize styles to prevent re-creation on every render
  const styles = React.useMemo(() => StyleSheet.create({
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
  }), [theme]); // Close useMemo with theme dependency

  // State-based rendering: simplified regeneration tracking
  useEffect(() => {
    // Clear regeneration flags when regeneration completes
    const completedIndices = Array.from(recentlyRegenerated).filter(index => 
      !regeneratingIndices.has(index)
    );
    
    if (completedIndices.length > 0) {
      setRecentlyRegenerated(prev => {
        const updated = new Set(prev);
        completedIndices.forEach(index => updated.delete(index));
        return updated;
      });
    }
  }, [regeneratingIndices, recentlyRegenerated]);

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
            useNativeDriver: false,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
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
    // State-based rendering: no complex animation triggers needed
    
    // Group consecutive messages from the same sender
    const showAvatar =
      index === 0 || (index > 0 && messagesWithLoading[index - 1].role !== item.role);
    const isLastInGroup =
      index === messagesWithLoading.length - 1 ||
      (index < messagesWithLoading.length - 1 && messagesWithLoading[index + 1].role !== item.role);

    // Debug logging removed for performance

    const handleRegenerate = () => {
      // Mark this index to track regeneration completion
      setRecentlyRegenerated(prev => new Set(prev).add(index));
      onRegenerate(index);
    };

    return (
      <MessageItem
        message={item}
        index={index}
        isNewMessageLoading={isNewMessageLoading && index === messages.length}
        isRegenerating={isRegenerating}

        onRegenerate={
          item.role === 'assistant' && !isRegenerating && !isNewMessageLoading
            ? handleRegenerate
            : undefined
        }
        onUserEditRegenerate={onUserEditRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
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
      extraData={[messages, isNewMessageLoading, regeneratingIndices, recentlyRegenerated]}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
      onLayout={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
};

export default MessageList; 