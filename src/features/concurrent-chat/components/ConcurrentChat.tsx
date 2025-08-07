import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../../shared/lib/supabase';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { EventBus } from '../core/events/EventBus';
import { useConcurrentChat } from '../core/hooks/useConcurrentChat';
import { useMessageCommands } from '../core/hooks/useMessageCommands';
import { useModelSelection } from '../core/hooks/useModelSelection';
import { usePluginSystem } from '../core/hooks/usePluginSystem';
import { ConcurrentAIService } from '../core/services/ConcurrentAIService';
import { IAIService } from '../core/types/interfaces/IAIService';
import { IMessageProcessor } from '../core/types/interfaces/IMessageProcessor';
import { IModelSelector } from '../core/types/interfaces/IModelSelector';
import { ModelSelector } from '../features/model-selection/components/ModelSelector';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ConcurrentChatProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
}

/**
 * ConcurrentChat - Main container component for concurrent chat functionality
 * 
 * This component orchestrates all concurrent chat features using the SOLID architecture:
 * - Manages state through useConcurrentChat hook
 * - Handles commands through useMessageCommands hook
 * - Coordinates plugins through usePluginSystem hook
 * - Manages model selection through useModelSelection hook
 * 
 * Features:
 * - Concurrent message sending without blocking UI
 * - Real-time message updates and streaming
 * - Plugin-based extensibility
 * - Model selection and switching
 * - Error handling and retry mechanisms
 * - Command pattern for all actions
 */
export const ConcurrentChat: React.FC<ConcurrentChatProps> = ({
  roomId,
  initialModel = 'gpt-3.5-turbo',
  className,
}) => {
  // Initialize event bus first
  const [eventBus] = useState(() => new EventBus());
  
  // Initialize core services
  const [serviceContainer] = useState(() => {
    const container = new ServiceContainer();
    
    // Register core services
    const realAIService = new ConcurrentAIService();
    container.register('aiService', realAIService);

    const mockMessageProcessor: IMessageProcessor = {
      process: async (message: any) => {
        // Mock message processor for demo
        console.log('Processing message:', message);
        
        try {
          // 1. Update user message to processing (API call starting)
          eventBus.publish('MESSAGE_SENT', {
            type: 'MESSAGE_SENT',
            timestamp: Date.now(),
            messageId: message.id,
            message: { ...message, status: 'processing' },
            content: message.content,
            model: message.model || 'gpt-3.5-turbo'
          });

          // Get current session for authentication
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('No active session found. Please log in.');
          }

          // 2. Mark user message as completed (API call started successfully)
          const completedUserMessage = {
            ...message,
            status: 'completed' as const
          };
          eventBus.publish('MESSAGE_COMPLETED', {
            type: 'MESSAGE_COMPLETED',
            timestamp: Date.now(),
            messageId: message.id,
            message: completedUserMessage,
            response: message.content
          });

          // 3. Create assistant message with processing status (skip pending)
          const assistantMessage = {
            id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: '',
            role: 'assistant' as const,
            status: 'processing' as const,
            timestamp: Date.now(),
            roomId: message.roomId,
            model: message.model || 'gpt-3.5-turbo'
          };

          // 4. Add assistant message to the list (processing state)
          eventBus.publish('MESSAGE_SENT', {
            type: 'MESSAGE_SENT',
            timestamp: Date.now(),
            messageId: assistantMessage.id,
            message: assistantMessage,
            content: assistantMessage.content,
            model: assistantMessage.model || 'gpt-3.5-turbo'
          });

          // 5. Get AI response (assistant message is processing)
          const aiService = container.get<IAIService>('aiService');
          const response = await aiService.sendMessage({
            messages: [message],
            model: message.model || 'gpt-3.5-turbo',
            roomId: message.roomId
          }, session);

          // 6. Update assistant message with real content and completed status
          const completedAssistantMessage = {
            ...assistantMessage,
            content: response.choices?.[0]?.message?.content || 'No response received',
            status: 'completed' as const
          };

          // 7. Publish MESSAGE_COMPLETED event for assistant message
          eventBus.publish('MESSAGE_COMPLETED', {
            type: 'MESSAGE_COMPLETED',
            timestamp: Date.now(),
            messageId: completedAssistantMessage.id,
            message: completedAssistantMessage,
            response: completedAssistantMessage.content
          });

          return completedAssistantMessage;
        } catch (error) {
          console.error('Message processing failed:', error);
          
          // Publish MESSAGE_FAILED event
          eventBus.publish('MESSAGE_FAILED', {
            type: 'MESSAGE_FAILED',
            timestamp: Date.now(),
            messageId: message.id,
            message: message,
            error: error instanceof Error ? error.message : 'Unknown error',
            retryable: true
          });
          
          throw error;
        }
      }
    };
    container.register('messageProcessor', mockMessageProcessor);

    const mockModelSelector: IModelSelector = {
      getAvailableModels: () => [
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ],
      getCurrentModel: () => 'gpt-3.5-turbo',
      setModel: async (model: string) => {
        console.log('Setting model to:', model);
      },
      getModelForRoom: async (roomId: number) => 'gpt-3.5-turbo'
    };
    container.register('modelSelector', mockModelSelector);

    container.register('messageService', {
      send: async (content: string, messageId: string, model: string) => {
        console.log('Sending message:', { content, messageId, model });
      },
      cancel: async (messageId: string) => {
        console.log('Cancelling message:', messageId);
      },
      retry: async (messageId: string) => {
        console.log('Retrying message:', messageId);
      }
    });

    container.register('validationService', {
      validate: (message: any) => {
        return message && message.content && message.content.trim().length > 0;
      }
    });

    return container;
  });
  
  // Initialize hooks
  const {
    messages,
    isLoading,
    currentModel,
    error,
    sendMessage,
    cancelMessage,
    retryMessage,
    clearMessages,
    changeModel,
    getAvailableModels,
    getPluginStats,
  } = useConcurrentChat(eventBus, serviceContainer, roomId);

  const { executeCommand, undoLastCommand, getCommandHistory, getHistoryCount } = useMessageCommands(eventBus, serviceContainer);
  const { plugins, registerPlugin, unregisterPlugin, pluginStats } = usePluginSystem(eventBus, serviceContainer);
  const { currentModel: selectedModel, availableModels, changeModel: changeModelFromHook } = useModelSelection(eventBus, serviceContainer, roomId);

  // Input state
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(inputValue.trim());
      setInputValue('');
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, sendMessage]);

  // Handle message actions
  const handleCancelMessage = useCallback(async (messageId: string) => {
    try {
      await cancelMessage(messageId);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to cancel message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [cancelMessage]);

  const handleRetryMessage = useCallback(async (messageId: string) => {
    try {
      await retryMessage(messageId);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to retry message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [retryMessage]);

  const handleClearMessages = useCallback(async () => {
    Alert.alert(
      'Clear Messages',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearMessages();
            } catch (err) {
              Alert.alert(
                'Error',
                `Failed to clear messages: ${err instanceof Error ? err.message : 'Unknown error'}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [clearMessages]);

  const handleModelChange = useCallback(async (newModel: string) => {
    try {
      await changeModel(newModel);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [changeModel]);

  // Handle undo last command
  const handleUndo = useCallback(async () => {
    try {
      await undoLastCommand();
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to undo: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [undoLastCommand]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header with model selector and controls */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
          Concurrent Chat
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ModelSelector
            currentModel={currentModel}
            availableModels={getAvailableModels()}
            onModelChange={handleModelChange}
          />
          
          {getHistoryCount() > 0 && (
            <Text 
              style={{ 
                marginLeft: 8, 
                padding: 4, 
                backgroundColor: '#007AFF', 
                color: 'white',
                borderRadius: 4,
                fontSize: 12
              }}
              onPress={handleUndo}
            >
              Undo
            </Text>
          )}
        </View>
      </View>

      {/* Error display */}
      {error && (
        <View style={{ 
          backgroundColor: '#ffebee', 
          padding: 12, 
          margin: 8,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#f44336'
        }}>
          <Text style={{ color: '#c62828', fontSize: 14 }}>
            {error}
          </Text>
        </View>
      )}

      {/* Messages list */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <MessageList
          messages={messages}
          onCancelMessage={handleCancelMessage}
          onRetryMessage={handleRetryMessage}
          onClearMessages={handleClearMessages}
        />
      </ScrollView>

      {/* Input area */}
      <MessageInput
        value={inputValue}
        onChangeText={setInputValue}
        onSend={handleSendMessage}
        isSending={isSending}
        disabled={isLoading}
        placeholder="Type your message..."
      />

      {/* Debug info (only in development) */}
      {__DEV__ && (
        <View style={{ 
          backgroundColor: '#f0f0f0', 
          padding: 8, 
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0'
        }}>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Messages: {messages.length} | 
            Plugins: {plugins.length} | 
                         Commands: {getHistoryCount()} | 
            Model: {currentModel}
          </Text>
        </View>
      )}
    </View>
  );
}; 