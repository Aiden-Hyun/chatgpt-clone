import { FlashList, FlashListRef } from "@shopify/flash-list";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { ChatMessage } from "@/entities/message";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";

import {
  AUTOSCROLL_THRESHOLD_PX,
  CURSOR_BLINK_DURATION_MS,
  TYPING_ANIMATION_SPEED,
} from "../../constants";
import { generateMessageId } from "../../utils/messageIdGenerator";
import { MessageItem } from "../MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  // ✅ STATE MACHINE: Remove legacy loading flag - derive from message states
  regeneratingIndex: number | null;
  onRegenerate: (index: number) => void;
  onUserEditRegenerate?: (index: number, newText: string) => void;
  showWelcomeText: boolean;
  // Like/dislike handlers
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  // Pull-to-refresh props
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  regeneratingIndex,
  onRegenerate,
  onUserEditRegenerate,
  showWelcomeText,
  onLike,
  onDislike,
  refreshing = false,
  onRefresh,
}) => {
  const flatListRef = useRef<FlashListRef<ChatMessage>>(null);
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const [displayedText, setDisplayedText] = useState("");
  const [selectedWelcomeKey, setSelectedWelcomeKey] = useState("");
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  // Stable IDs for messages to ensure consistent FlatList keys
  const stableIdsRef = useRef<string[]>([]);
  const placeholderIdRef = useRef<string | null>(null);
  const autoScrollEnabledRef = useRef<boolean>(true);
  const didInitialScrollRef = useRef<boolean>(false);

  // Simplified state tracking for regeneration
  const [recentlyRegenerated, setRecentlyRegenerated] = useState<Set<number>>(
    new Set()
  );

  // Array of welcome message keys
  const welcomeMessageKeys = useMemo(
    () => [
      "welcome.how_are_you",
      "welcome.whats_on_mind",
      "welcome.how_can_help",
      "welcome.what_to_chat",
      "welcome.ready_to_help",
      "welcome.shall_we_explore",
      "welcome.create_amazing",
      "welcome.next_big_idea",
      "welcome.ready_adventure",
      "welcome.help_discover",
    ],
    []
  );

  const typingSpeed = TYPING_ANIMATION_SPEED; // milliseconds per character

  // ✅ STATE MACHINE: Derive loading state from message states
  const isNewMessageLoading = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage?.role === "assistant" && lastMessage?.state === "loading"
    );
  }, [messages]);

  // Memoize styles to prevent re-creation on every render
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xs,
          flexGrow: 1,
        },
        welcomeContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: theme.spacing.xl,
        },
        welcomeText: {
          fontSize: theme.typography.fontSizes.xl,
          fontFamily: theme.typography.fontFamily.primary,
          color: theme.colors.text.secondary,
          fontWeight: theme.typography.fontWeights.medium as "500",
          textAlign: "center",
          lineHeight: theme.typography.fontSizes.xl * 1.4,
        },
        cursor: {
          fontSize: theme.typography.fontSizes.xl,
          color: theme.colors.text.secondary,
          fontWeight: theme.typography.fontWeights.medium as "500",
        },
      }),
    [theme]
  ); // Close useMemo with theme dependency

  // State-based rendering: simplified regeneration tracking
  useEffect(() => {
    // Clear regeneration flags when regeneration completes
    const completedIndices = Array.from(recentlyRegenerated).filter(
      (index) => regeneratingIndex !== index
    );

    if (completedIndices.length > 0) {
      setRecentlyRegenerated((prev) => {
        const updated = new Set(prev);
        completedIndices.forEach((index) => updated.delete(index));
        return updated;
      });
    }
  }, [regeneratingIndex, recentlyRegenerated]);

  // Select random welcome message when component mounts or welcome text should be shown
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
      const randomKey =
        welcomeMessageKeys[
          Math.floor(Math.random() * welcomeMessageKeys.length)
        ];

      setSelectedWelcomeKey(randomKey);
    }
  }, [
    messages.length,
    showWelcomeText,
    isNewMessageLoading,
    welcomeMessageKeys,
  ]);

  // Track animation state to prevent multiple concurrent animations
  const animationRunningRef = useRef(false);
  const currentWelcomeKeyRef = useRef<string>("");
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typewriter animation effect - with stable animation to prevent restarts
  useEffect(() => {
    if (
      messages.length === 0 &&
      showWelcomeText &&
      !isNewMessageLoading &&
      selectedWelcomeKey
    ) {
      // Prevent starting new animation if one is already running for the same key
      if (
        animationRunningRef.current &&
        currentWelcomeKeyRef.current === selectedWelcomeKey
      ) {
        return;
      }

      const welcomeMessage = t(selectedWelcomeKey);

      // Mark animation as running
      animationRunningRef.current = true;
      currentWelcomeKeyRef.current = selectedWelcomeKey;

      // Reset animation when welcome text should be shown
      setDisplayedText("");
      let currentIndex = 0;
      let isCancelled = false; // Prevent race conditions

      const typeNextChar = () => {
        if (isCancelled) return; // Stop if effect was cleaned up

        if (currentIndex < welcomeMessage.length) {
          setDisplayedText(welcomeMessage.slice(0, currentIndex + 1)); // Use slice instead of concatenation
          currentIndex++;
          typewriterTimeoutRef.current = setTimeout(typeNextChar, typingSpeed);
        } else {
          // Animation complete
          animationRunningRef.current = false;
          typewriterTimeoutRef.current = null;
        }
      };

      // Start animation
      typewriterTimeoutRef.current = setTimeout(typeNextChar, typingSpeed);

      // Cleanup function
      return () => {
        isCancelled = true;
        animationRunningRef.current = false;
        if (typewriterTimeoutRef.current) {
          clearTimeout(typewriterTimeoutRef.current);
          typewriterTimeoutRef.current = null;
        }
      };
    }
  }, [
    selectedWelcomeKey,
    messages.length,
    showWelcomeText,
    isNewMessageLoading,
    t,
    typingSpeed,
  ]);

  // Blinking cursor animation
  useEffect(() => {
    if (messages.length === 0 && showWelcomeText && !isNewMessageLoading) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: CURSOR_BLINK_DURATION_MS,
            useNativeDriver: false,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: CURSOR_BLINK_DURATION_MS,
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
      const explicitId =
        (messages[i] as ChatMessage & { _loadingId?: string }).id ??
        (messages[i] as ChatMessage & { _loadingId?: string })._loadingId;
      if (explicitId) {
        ids[i] = explicitId;
      } else if (!ids[i]) {
        ids[i] = generateMessageId();
      }
    }
  }, [messages]);

  // Prepare messages with stable ids for rendering (must be before early return)
  const messagesWithIds = useMemo(
    () =>
      messages.map((m, i) => {
        const existingId = (m as ChatMessage & { _loadingId?: string }).id as
          | string
          | undefined;
        const loadingId = (m as ChatMessage & { _loadingId?: string })
          ._loadingId as string | undefined;
        const resolvedId = existingId ?? loadingId ?? stableIdsRef.current[i];
        return {
          ...(m as ChatMessage & { _loadingId?: string }),
          id: resolvedId,
        } as ChatMessage;
      }) as ChatMessage[],
    [messages]
  );

  // Add empty assistant message for new message loading, with a stable id
  const messagesWithLoading = useMemo(
    () =>
      isNewMessageLoading
        ? [
            ...messagesWithIds,
            {
              role: "assistant" as const,
              content: "",
              id: (placeholderIdRef.current ||= generateMessageId()),
            } as ChatMessage,
          ]
        : messagesWithIds,
    [messagesWithIds, isNewMessageLoading]
  );

  // Memoize extraData array to prevent unnecessary re-renders
  const extraDataArray = useMemo(
    () => [isNewMessageLoading, regeneratingIndex],
    [isNewMessageLoading, regeneratingIndex]
  );

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

  const renderMessage = ({
    item,
    index,
  }: {
    item: ChatMessage;
    index: number;
  }) => {
    // Handle search results messages

    // Find the correct index in the original messages array for regeneration check
    const originalMessageIndex = messages.findIndex(
      (msg) => msg.id === item.id
    );
    const isRegenerating =
      originalMessageIndex !== -1
        ? regeneratingIndex === originalMessageIndex
        : false;
    // State-based rendering: no complex animation triggers needed

    // Group consecutive messages from the same sender
    const showAvatar =
      index === 0 ||
      (index > 0 && messagesWithLoading[index - 1].role !== item.role);
    const isLastInGroup =
      index === messagesWithLoading.length - 1 ||
      (index < messagesWithLoading.length - 1 &&
        messagesWithLoading[index + 1].role !== item.role);

    const handleRegenerate = () => {
      // Find the correct index in the original messages array
      // The FlashList index might not match the original messages array due to loading messages
      const originalMessageIndex = messages.findIndex(
        (msg) => msg.id === item.id
      );

      if (originalMessageIndex === -1) {
        console.warn(
          "Could not find message in original array for regeneration"
        );
        return;
      }

      // Mark this index to track regeneration completion
      setRecentlyRegenerated((prev) => new Set(prev).add(originalMessageIndex));

      onRegenerate(originalMessageIndex);
    };

    return (
      <MessageItem
        message={item}
        index={originalMessageIndex !== -1 ? originalMessageIndex : index}
        isRegenerating={isRegenerating}
        onRegenerate={
          item.role === "assistant" && !isRegenerating && !isNewMessageLoading
            ? handleRegenerate
            : undefined
        }
        onUserEditRegenerate={onUserEditRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
        onLike={onLike}
        onDislike={onDislike}
      />
    );
  };

  return (
    <FlashList
      data={messagesWithLoading}
      keyExtractor={(item: ChatMessage) => item.id}
      renderItem={renderMessage}
      contentContainerStyle={styles.container}
      ref={flatListRef}
      extraData={extraDataArray}
      // Pull-to-refresh functionality
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
      // 🚀 FlashList Optimization (estimatedItemSize not available in this version)
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentHeight = e.nativeEvent.contentSize.height;
        const viewportHeight = e.nativeEvent.layoutMeasurement.height;
        const offsetY = e.nativeEvent.contentOffset.y;
        const distanceToBottom = contentHeight - (offsetY + viewportHeight);
        autoScrollEnabledRef.current =
          distanceToBottom <= AUTOSCROLL_THRESHOLD_PX;
      }}
      onContentSizeChange={() => {
        if (messagesWithLoading.length > 0 && autoScrollEnabledRef.current) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
      onLayout={() => {
        if (!didInitialScrollRef.current && messagesWithLoading.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: false });
          didInitialScrollRef.current = true;
        }
      }}
    />
  );
};

export default MessageList;
