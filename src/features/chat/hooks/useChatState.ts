import { useCallback, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { logger } from '../utils/logger';

interface LoadingStates {
  // ❌ Remove single boolean - replace with message-specific tracking
  // newMessage?: boolean;
  regenerating?: Set<number>;
  // ✅ Add message-specific tracking
  processingMessages: Set<string>;
}

interface MessageQueueItem {
  id: string;
  content: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ChatState {
  messages: ChatMessage[];
  loadingStates: LoadingStates;
  loading: boolean;
  messageQueue: MessageQueueItem[];
}

export const useChatState = (roomId: number | null) => {
  // Add render counting for performance monitoring
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Log render count every 5 renders
  if (renderCount.current % 5 === 0) {
    console.log(`[RENDER-COUNT] useChatState: ${renderCount.current} renders`);
  }

  // Performance optimization: Memoize state to prevent unnecessary re-renders
  const memoizedState = useRef<ChatState | null>(null);
  const lastStateHash = useRef<string>('');

  const [state, setState] = useState<ChatState>({
    messages: [],
    loadingStates: {
      regenerating: new Set(),
      processingMessages: new Set(),
    },
    loading: true,
    messageQueue: [],
  });

  // State getters
  const { messages, loadingStates, loading, messageQueue } = state;
  // ❌ Remove single boolean getter
  // const isNewMessageLoading = loadingStates.newMessage;
  const regeneratingIndices = loadingStates.regenerating || new Set();
  const processingMessages = loadingStates.processingMessages || new Set();

  // OPTIMIZED: Single state setter to prevent multiple re-renders
  const updateState = useCallback((updates: Partial<{
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]);
    loadingStates: Partial<LoadingStates> | ((prev: LoadingStates) => LoadingStates);
    loading: boolean;
    messageQueue: MessageQueueItem[] | ((prev: MessageQueueItem[]) => MessageQueueItem[]);
  }>) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (updates.messages !== undefined) {
        newState.messages = typeof updates.messages === 'function' 
          ? updates.messages(prev.messages) 
          : updates.messages;
      }
      
      if (updates.loadingStates !== undefined) {
        newState.loadingStates = typeof updates.loadingStates === 'function'
          ? updates.loadingStates(prev.loadingStates)
          : { ...prev.loadingStates, ...updates.loadingStates };
      }
      
      if (updates.loading !== undefined) {
        newState.loading = updates.loading;
      }
      
      if (updates.messageQueue !== undefined) {
        newState.messageQueue = typeof updates.messageQueue === 'function'
          ? updates.messageQueue(prev.messageQueue)
          : updates.messageQueue;
      }
      
      return newState;
    });
  }, []);

  // Legacy setters for backward compatibility (will be removed in Phase 2)
  const setMessages = useCallback((newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    updateState({ messages: newMessages });
  }, [updateState]);

  const setLoadingStates = useCallback((newLoadingStates: Partial<LoadingStates> | ((prev: LoadingStates) => LoadingStates)) => {
    updateState({ loadingStates: newLoadingStates });
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading });
  }, [updateState]);

  const setMessageQueue = useCallback((newQueue: MessageQueueItem[] | ((prev: MessageQueueItem[]) => MessageQueueItem[])) => {
    updateState({ messageQueue: newQueue });
  }, [updateState]);

  // Loading state actions - NEW MESSAGE-SPECIFIC FUNCTIONS
  const startMessageProcessing = useCallback((messageId: string) => {
    logger.info('Starting message processing', { messageId });
    updateState({
      loadingStates: prev => {
        const newState = { 
          ...prev, 
          processingMessages: new Set([...(prev.processingMessages || []), messageId]) 
        };
        logger.debug('Updated loading states', { 
          messageId, 
          processingCount: newState.processingMessages.size 
        });
        return newState;
      }
    });
  }, [updateState]);

  const stopMessageProcessing = useCallback((messageId: string) => {
    logger.info('Stopping message processing', { messageId });
    updateState({
      loadingStates: prev => {
        const newProcessing = new Set(prev.processingMessages || []);
        newProcessing.delete(messageId);
        const newState = { ...prev, processingMessages: newProcessing };
        logger.debug('Updated loading states', { 
          messageId, 
          processingCount: newState.processingMessages.size 
        });
        return newState;
      }
    });
  }, [updateState]);

  const isMessageProcessing = useCallback((messageId: string) => {
    const isProcessing = processingMessages.has(messageId);
    logger.debug('Checking message processing status', { messageId, isProcessing });
    return isProcessing;
  }, [processingMessages]);

  const getProcessingMessageIds = useCallback(() => {
    return Array.from(processingMessages);
  }, [processingMessages]);

  // Message queue functions
  const addMessageToQueue = useCallback((messageId: string, content: string) => {
    logger.info('Adding message to queue', { messageId, contentLength: content.length });
    updateState({
      messageQueue: prev => {
        const newQueueItem: MessageQueueItem = {
          id: messageId, 
          content, 
          status: 'pending', 
          timestamp: Date.now() 
        };
        const newQueue = [...prev, newQueueItem];
        logger.debug('Updated message queue', { 
          messageId, 
          queueSize: newQueue.length 
        });
        return newQueue;
      }
    });
  }, [updateState]);

  const updateMessageStatus = useCallback((messageId: string, status: MessageStatus) => {
    logger.info('Updating message status', { messageId, status });
    updateState({
      messageQueue: prev => {
        const newQueue = prev.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        );
        logger.debug('Updated message queue status', { 
          messageId, 
          status, 
          queueSize: newQueue.length 
        });
        return newQueue;
      }
    });
  }, [updateState]);

  const removeMessageFromQueue = useCallback((messageId: string) => {
    logger.info('Removing message from queue', { messageId });
    updateState({
      messageQueue: prev => {
        const newQueue = prev.filter(msg => msg.id !== messageId);
        logger.debug('Updated message queue', { 
          messageId, 
          queueSize: newQueue.length 
        });
        return newQueue;
      }
    });
  }, [updateState]);

  // NEW: Batch cleanup function to prevent multiple re-renders
  const cleanupMessageProcessing = useCallback((messageId: string) => {
    logger.info('Batch cleaning up message processing', { messageId });
    
    // Use optimized state setter for single re-render
    updateState({
      loadingStates: prev => {
        const newProcessing = new Set(prev.processingMessages || []);
        newProcessing.delete(messageId);
        return { ...prev, processingMessages: newProcessing };
      },
      messageQueue: prev => prev.filter(msg => msg.id !== messageId),
    });
    
    logger.debug('Batch cleanup completed', { messageId });
  }, [updateState]);

  // NEW: Batch setup function to prevent multiple re-renders
  const setupMessageProcessing = useCallback((messageId: string, content: string) => {
    logger.info('Batch setting up message processing', { messageId, contentLength: content.length });
    
    // Use optimized state setter for single re-render
    updateState({
      loadingStates: prev => {
        const newProcessing = new Set(prev.processingMessages || []);
        newProcessing.add(messageId);
        return { ...prev, processingMessages: newProcessing };
      },
      messageQueue: prev => {
        const newQueueItem: MessageQueueItem = {
          id: messageId, 
          content, 
          status: 'processing', 
          timestamp: Date.now() 
        };
        return [...prev, newQueueItem];
      },
    });
    
    logger.debug('Batch setup completed', { messageId });
  }, [updateState]);

  // NEW: Batch error handling function
  const handleMessageError = useCallback((messageId: string) => {
    logger.info('Batch handling message error', { messageId });
    
    // Use optimized state setter for single re-render
    updateState({
      loadingStates: prev => {
        const newProcessing = new Set(prev.processingMessages || []);
        newProcessing.delete(messageId);
        return { ...prev, processingMessages: newProcessing };
      },
      messageQueue: prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'failed' as const } : msg
      ),
    });
    
    logger.debug('Batch error handling completed', { messageId });
  }, [updateState]);

  // ✅ Phase 2: Legacy functions removed - no longer needed

  const startRegenerating = useCallback((index: number) => {
    updateState({
      loadingStates: prev => ({
        ...prev,
        regenerating: new Set([...(prev.regenerating || []), index]),
      })
    });
  }, [updateState]);

  const stopRegenerating = useCallback((index: number) => {
    updateState({
      loadingStates: prev => {
        const newRegenerating = new Set(prev.regenerating || []);
        newRegenerating.delete(index);
        return { ...prev, regenerating: newRegenerating };
      }
    });
  }, [updateState]);

  const isRegenerating = useCallback((index: number) => {
    return regeneratingIndices.has(index);
  }, [regeneratingIndices]);

  return {
    // State
    messages,
    loading,
    // ❌ Remove legacy state
    // isNewMessageLoading,
    regeneratingIndices,
    processingMessages,
    messageQueue,
    isRegenerating,
    
    // State setters
    setMessages,
    setLoadingStates,
    setLoading,
    setMessageQueue,
    
    // NEW: Message-specific loading actions
    startMessageProcessing,
    stopMessageProcessing,
    isMessageProcessing,
    getProcessingMessageIds,
    
    // NEW: Message queue actions
    addMessageToQueue,
    updateMessageStatus,
    removeMessageFromQueue,
    cleanupMessageProcessing,
    setupMessageProcessing,
    handleMessageError,
    
    // ✅ Phase 2: Legacy functions removed
    
    // Regeneration actions (unchanged)
    startRegenerating,
    stopRegenerating,
  };
}; 