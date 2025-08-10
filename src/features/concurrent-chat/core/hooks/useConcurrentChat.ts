import { useCallback, useEffect, useRef, useState } from 'react';
import { ServiceContainer } from '../container/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { MESSAGE_EVENT_TYPES, MessageEvent } from '../types/events';
import { IAIService } from '../types/interfaces/IAIService';
import { ConcurrentMessage, IMessageProcessor } from '../types';
import { IModelSelector } from '../types/interfaces/IModelSelector';

// In-memory cache removed to avoid stale/partial history across navigation

/**
 * Main hook for concurrent chat functionality
 * Manages state, message processing, and plugin coordination
 */
export function useConcurrentChat(
  eventBus: EventBus,
  serviceContainer: ServiceContainer,
  roomId?: number
) {
  // Core services (no plugin manager)
  
  // State
  const [messages, setMessages] = useState<ConcurrentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup
  const messageProcessorRef = useRef<IMessageProcessor | null>(null);
  const aiServiceRef = useRef<IAIService | null>(null);
  const modelSelectorRef = useRef<IModelSelector | null>(null);
  const eventSubscriptionsRef = useRef<string[]>([]);

  // Initialize services and plugins
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Get services from container
        messageProcessorRef.current = serviceContainer.get<IMessageProcessor>('messageProcessor');
        aiServiceRef.current = serviceContainer.get<IAIService>('aiService');
        modelSelectorRef.current = serviceContainer.get<IModelSelector>('modelSelector');

        // Set up event subscriptions
        setupEventSubscriptions();

        // Load current model for room
        if (roomId && modelSelectorRef.current) {
          const model = await modelSelectorRef.current.getModelForRoom(roomId);
          setCurrentModel(model);
        }
        try { console.log('[STATE] init', { roomId, model: roomId ? 'room' : 'global' }); } catch {}
      } catch (err) {
        setError(`Failed to initialize services: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initializeServices();

    // Cleanup function
    return () => {
      cleanupEventSubscriptions();
    };
  }, [roomId, serviceContainer, eventBus]);

  // Cache removed: always rely on DB hydration performed by ConcurrentChat on room change

  // Set up event subscriptions
  const setupEventSubscriptions = useCallback(() => {
    const subscriptions: string[] = [];

    // Subscribe to message events
    subscriptions.push(
      eventBus.subscribe(MESSAGE_EVENT_TYPES.MESSAGE_SENT, (event: MessageEvent) => {
                if (event.type === MESSAGE_EVENT_TYPES.MESSAGE_SENT) {
          
          
          setMessages(prev => {
          // Check if this message already exists
          const existingMessageIndex = prev.findIndex(msg => msg.id === event.message.id);
          
          if (existingMessageIndex >= 0) {
            const updatedMessages = [...prev];
            const isAssistant = event.message.role === 'assistant';
            // Only set processing for assistant placeholders; user messages should reflect completed status
            updatedMessages[existingMessageIndex] = isAssistant
              ? { ...updatedMessages[existingMessageIndex], status: 'processing' }
              : { ...updatedMessages[existingMessageIndex], ...event.message };

            try { console.log('[EVT] SENT:update-existing', { id: event.message.id, role: event.message.role }); } catch {}
            return updatedMessages;
          } else {
            // Add new message (for assistant messages)
            try { console.log('[EVT] SENT:add', { id: event.message.id }); } catch {}
            return [...prev, event.message];
          }
        });
        }
      })
    );

    subscriptions.push(
      eventBus.subscribe(MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED, (event: MessageEvent) => {
        if (event.type === MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED) {
          
          
          setMessages(prev => {
          // Check if this message already exists
          const existingMessageIndex = prev.findIndex(msg => msg.id === event.message.id);
          
          if (existingMessageIndex >= 0) {
            // Update existing message
            const updatedMessages = [...prev];
            updatedMessages[existingMessageIndex] = { ...event.message };
            
            try { console.log('[EVT] DONE:update-existing', { id: event.message.id }); } catch {}
            return updatedMessages;
          } else {
            // Add new message (for assistant messages)
            try { console.log('[EVT] DONE:add', { id: event.message.id }); } catch {}
            return [...prev, event.message];
          }
        });
        }
      })
    );

    subscriptions.push(
      eventBus.subscribe(MESSAGE_EVENT_TYPES.MESSAGE_FAILED, (event: MessageEvent) => {
        if (event.type === MESSAGE_EVENT_TYPES.MESSAGE_FAILED) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === event.message.id 
                ? { ...msg, status: 'failed', error: event.error }
                : msg
            )
          );
          setError(event.error);
        }
      })
    );

    subscriptions.push(
      eventBus.subscribe(MESSAGE_EVENT_TYPES.MESSAGE_CANCELLED, (event: MessageEvent) => {
        if (event.type === MESSAGE_EVENT_TYPES.MESSAGE_CANCELLED) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === event.message.id 
                ? { ...msg, status: 'cancelled' }
                : msg
            )
          );
        }
      })
    );

    subscriptions.push(
      eventBus.subscribe(MESSAGE_EVENT_TYPES.MODEL_CHANGED, (event: MessageEvent) => {
        if (event.type === MESSAGE_EVENT_TYPES.MODEL_CHANGED) {
          setCurrentModel(event.newModel);
        }
      })
    );

    eventSubscriptionsRef.current = subscriptions;
  }, [eventBus]);

  // Clean up event subscriptions
  const cleanupEventSubscriptions = useCallback(() => {
    eventSubscriptionsRef.current.forEach(subscriptionId => {
      eventBus.unsubscribeById(subscriptionId);
    });
    eventSubscriptionsRef.current = [];
  }, [eventBus]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message: ConcurrentMessage = {
        id: messageId,
        content: content.trim(),
        role: 'user',
        status: 'pending',
        timestamp: Date.now(),
        roomId,
        model: currentModel,
        metadata: { context: messages },
      };

      // Add message to state immediately
      setMessages(prev => [...prev, message]);

      // Process the message
      if (messageProcessorRef.current) {
        await messageProcessorRef.current.process(message);
      }
    } catch (err) {
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentModel, roomId]);

  // Cancel a message
  const cancelMessage = useCallback(async (messageId: string) => {
    try {
      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'cancelled' }
            : msg
        )
      );

      // Publish cancel event
      eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_CANCELLED, {
        type: MESSAGE_EVENT_TYPES.MESSAGE_CANCELLED,
        timestamp: Date.now(),
        messageId,
        message: messages.find(m => m.id === messageId),
      });
    } catch (err) {
      setError(`Failed to cancel message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [eventBus, messages]);

  // Retry a message
  const retryMessage = useCallback(async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Create new message with same content
      const newMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: ConcurrentMessage = {
        ...message,
        id: newMessageId,
        status: 'pending',
        timestamp: Date.now(),
        error: undefined,
      };

      // Add new message
      setMessages(prev => [...prev, newMessage]);

      // Process the message
      if (messageProcessorRef.current) {
        await messageProcessorRef.current.process(newMessage);
      }
    } catch (err) {
      setError(`Failed to retry message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [messages]);

  // Clear all messages
  const clearMessages = useCallback(async () => {
    try {
      setMessages([]);
      
      // Publish clear event
      eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGES_CLEARED, {
        type: MESSAGE_EVENT_TYPES.MESSAGES_CLEARED,
        timestamp: Date.now(),
        roomId,
        clearedCount: messages.length,
      });
    } catch (err) {
      setError(`Failed to clear messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [eventBus, messages.length, roomId]);

  // Update a specific message
  const updateMessage = useCallback((messageId: string, updates: Partial<ConcurrentMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, ...updates }
        : msg
    ));
  }, []);

  // Replace all messages (hydration)
  const replaceMessages = useCallback((newMessages: ConcurrentMessage[]) => {
    try {
      if (newMessages.length === 0) {
        console.log('[STATE] replaceMessages EMPTY');
      } else {
        console.log('[STATE] replaceMessages APPLY', { len: newMessages.length, first: newMessages[0]?.id, last: newMessages[newMessages.length - 1]?.id });
      }
    } catch {}
    setMessages(newMessages);
  }, []);

  // Change model
  const changeModel = useCallback(async (newModel: string) => {
    try {
      if (modelSelectorRef.current) {
        await modelSelectorRef.current.setModel(newModel);
        setCurrentModel(newModel);
      }
    } catch (err) {
      setError(`Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Get available models
  const getAvailableModels = useCallback(() => {
    if (modelSelectorRef.current) {
      return modelSelectorRef.current.getAvailableModels();
    }
    return [];
  }, []);

  // Get plugin statistics (removed)
  const getPluginStats = useCallback(() => ({ total: 0, eventPlugins: 0, renderPlugins: 0, lifecyclePlugins: 0, active: 0, initialized: 0 }), []);

  return {
    // State
    messages,
    isLoading,
    currentModel,
    error,
    
    // Actions
    sendMessage,
    cancelMessage,
    retryMessage,
    clearMessages,
    updateMessage,
    replaceMessages,
    changeModel,
    
    // Utilities
    getAvailableModels,
    getPluginStats,
    
    // Services (for advanced usage)
    eventBus,
    serviceContainer,
    // pluginManager removed
  };
} 