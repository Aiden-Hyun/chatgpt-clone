import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface AnimationItem {
  id: string;
  content: string;
  status: 'pending' | 'running' | 'completed';
}

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  shouldAnimate?: boolean; // Whether this message should animate (typewriter)
  animationTrigger?: string; // token to force-start animation when it changes
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onRegenerate,
  showAvatar = true, // (kept for future use)
  isLastInGroup = true,
  shouldAnimate = false,
  animationTrigger,
}) => {
  /* -------------------------------------------------------------------------- */
  /* State                                                                      */
  /* -------------------------------------------------------------------------- */
  const [animationQueue, setAnimationQueue] = useState<AnimationItem[]>([]);
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Refs & Styles                                                              */
  /* -------------------------------------------------------------------------- */
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const styles = createAssistantMessageStyles();

  /* -------------------------------------------------------------------------- */
  /* Enqueue new animation whenever content changes & shouldAnimate is true     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if ((shouldAnimate || animationTrigger) && message.content && message.content.trim().length > 0) {
      const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Prepare UI immediately to avoid flashing full text
      setDisplayedContent('');
      setShowCursor(true);
      setAnimationQueue(prev => [
        ...prev,
        { id: animationId, content: message.content, status: 'pending' },
      ]);
      try { console.log('[ANIM] enqueue', { len: message.content.length, trigger: !!animationTrigger, shouldAnimate }); } catch {}
    }
  }, [shouldAnimate, message.content, animationTrigger]);

  /* -------------------------------------------------------------------------- */
  /* Start any pending animations – allows multiple concurrent animations       */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    setAnimationQueue(prev => {
      const updated = [...prev];
      updated.forEach(item => {
        if (item.status === 'pending') {
          startAnimation(item.id, item.content);
          item.status = 'running';
        }
      });
      return updated;
    });
    // We only care when queue length changes (new animation enqueued)
  }, [animationQueue.length]);

  /* -------------------------------------------------------------------------- */
  /* Animation helpers                                                          */
  /* -------------------------------------------------------------------------- */
  const startAnimation = (animationId: string, content: string) => {
    const typewriterSpeed = 35; // ms per character
    const characters = content.split('');
    let currentIndex = 0;

    // Start / restart cursor blink
    if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
    setShowCursor(true);
    cursorIntervalRef.current = setInterval(() => setShowCursor(prev => !prev), 500);

    // Typewriter effect
    const typeNext = () => {
      if (currentIndex < characters.length) {
        setDisplayedContent(characters.slice(0, currentIndex + 1).join(''));
        currentIndex += 1;
        const t = setTimeout(typeNext, typewriterSpeed);
        animationTimeoutsRef.current.set(animationId, t);
      } else {
        endAnimation(animationId, content);
      }
    };

    try { console.log('[ANIM] start'); } catch {}
    typeNext();
  };

  const endAnimation = (animationId: string, finalContent: string) => {
    setAnimationQueue(prev => prev.map(item => item.id === animationId ? { ...item, status: 'completed' } : item));
    setDisplayedContent(finalContent);
    if (cursorIntervalRef.current) {
      clearInterval(cursorIntervalRef.current);
      cursorIntervalRef.current = null;
    }
    setShowCursor(false);
    try { console.log('[ANIM] end'); } catch {}
    const timeout = animationTimeoutsRef.current.get(animationId);
    if (timeout) clearTimeout(timeout);
    animationTimeoutsRef.current.delete(animationId);
  };

  /* -------------------------------------------------------------------------- */
  /* Cleanup on unmount                                                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
      animationTimeoutsRef.current.forEach(t => clearTimeout(t));
      animationTimeoutsRef.current.clear();
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Helpers                                                                    */
  /* -------------------------------------------------------------------------- */
  // Consider both 'pending' and 'running' as animating to avoid flashing final text
  const isAnimating = animationQueue.some(a => a.status === 'running' || a.status === 'pending');
  const displayText = isAnimating ? displayedContent : message.content;

  /* -------------------------------------------------------------------------- */
  /* Render                                                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <Text style={styles.text}>
        {displayText}
        {isAnimating && showCursor && <Text style={styles.cursor}>|</Text>}
      </Text>

      {/* Interaction bar appears only when not animating */}
      {message.content && !isAnimating && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
          onLike={() => console.log('Like pressed')}
          onDislike={() => console.log('Dislike pressed')}
          onShare={async () => {
            try {
              const text = message.content || '';
              if (!text) return;
              // Web: navigator.share if available
              if (typeof navigator !== 'undefined' && (navigator as any).share) {
                await (navigator as any).share({ title: 'Chat', text });
                return;
              }
              // Native: React Native Share
              const RN = require('react-native');
              if (RN && RN.Share && RN.Share.share) {
                await RN.Share.share({ message: text });
                return;
              }
            } catch {}
          }}
          onCopy={() => {
            try {
              if (typeof navigator !== 'undefined' && navigator.clipboard && message.content) {
                navigator.clipboard.writeText(message.content);
              }
            } catch {}
          }}
          onAudio={() => console.log('Audio pressed')}
        />
      )}
    </View>
  );
};
