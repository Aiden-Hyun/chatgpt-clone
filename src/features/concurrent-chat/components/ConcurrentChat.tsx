import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
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
import { SendMessageCommand } from '../core/commands/SendMessageCommand';
import { CancelMessageCommand } from '../core/commands/CancelMessageCommand';
import { RetryMessageCommand } from '../core/commands/RetryMessageCommand';
import { ChangeModelCommand } from '../core/commands/ChangeModelCommand';
import { ClearMessagesCommand } from '../core/commands/ClearMessagesCommand';
import { ModelSelector } from '../features/model-selection/components/ModelSelector';

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
        console.log('🔍 Processing message:', message.id, message.content);
        
        try {
          // 1. Ensure message has correct role and update to processing (API call starting)
          const userMessageWithRole = {
            ...message,
            role: 'user' as const,
            status: 'processing' as const
          };
          
          console.log('🔍 Publishing MESSAGE_COMPLETED for user message:', message.id);
          
          // Don't publish MESSAGE_SENT for user message since it's already added by the hook
          // Just update the existing message to processing status
          eventBus.publish('MESSAGE_COMPLETED', {
            type: 'MESSAGE_COMPLETED',
            timestamp: Date.now(),
            messageId: message.id,
            message: userMessageWithRole,
            response: message.content
          });

          // Get current session for authentication
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('No active session found. Please log in.');
          }

          // 2. User message is already marked as completed above

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
          console.log('🔍 Publishing MESSAGE_SENT for assistant message:', assistantMessage.id);
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
          // Format message for OpenAI API
          const formattedMessage = {
            role: message.role || 'user', // Default to 'user' if role is missing
            content: message.content
          };
          
          const response = await aiService.sendMessage({
            messages: [formattedMessage],
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
          console.log('🔍 Publishing MESSAGE_COMPLETED for assistant message:', completedAssistantMessage.id);
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

  // Handle send message using Command Pattern
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    try {
      setIsSending(true);
      
      // Get message processor from service container
      const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
      
      // Create and execute SendMessageCommand
      const sendCommand = new SendMessageCommand(messageProcessor, inputValue.trim(), roomId || null);
      await executeCommand(sendCommand);
      
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
  }, [inputValue, isSending, executeCommand, serviceContainer, roomId]);

  // Handle message actions using Command Pattern
  const handleCancelMessage = useCallback(async (messageId: string) => {
    try {
      // Get message processor from service container
      const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
      
      // Create and execute CancelMessageCommand
      const cancelCommand = new CancelMessageCommand(messageProcessor, messageId);
      await executeCommand(cancelCommand);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to cancel message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [executeCommand, serviceContainer]);

  const handleRetryMessage = useCallback(async (messageId: string) => {
    try {
      // Get message processor from service container
      const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
      
      // Create and execute RetryMessageCommand
      const retryCommand = new RetryMessageCommand(messageProcessor, messageId);
      await executeCommand(retryCommand);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to retry message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [executeCommand, serviceContainer]);

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
              // Get message processor from service container
              const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
              
              // Create and execute ClearMessagesCommand
              const clearCommand = new ClearMessagesCommand(messageProcessor, roomId || 1);
              await executeCommand(clearCommand);
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
  }, [executeCommand, serviceContainer, roomId]);

  const handleModelChange = useCallback(async (newModel: string) => {
    try {
      // Get model selector from service container
      const modelSelector = serviceContainer.get<IModelSelector>('modelSelector');
      
      // Create and execute ChangeModelCommand
      const changeModelCommand = new ChangeModelCommand(modelSelector, newModel, roomId || null);
      await executeCommand(changeModelCommand);
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [executeCommand, serviceContainer, roomId]);

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
        {/* Message count and clear button */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 8,
          paddingHorizontal: 8
        }}>
          <Text style={{ fontSize: 14, color: '#666' }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Text>
          {messages.length > 0 && (
            <Text 
              style={{ 
                color: '#007AFF', 
                fontSize: 14,
                padding: 4
              }}
              onPress={handleClearMessages}
            >
              Clear All
            </Text>
          )}
        </View>

        {/* Messages */}
        {(() => { 
          console.log('🔍 Messages State:', messages.length, 'messages');
          messages.forEach((m, i) => console.log(`  ${i}: ${m.role} - "${m.content.substring(0, 30)}..." (ID: ${m.id})`));
          return null; 
        })()}
        {messages.map((message, index) => (
          <View 
            key={message.id || index}
            style={{
              marginBottom: 12,
              padding: 12,
              backgroundColor: message.role === 'user' ? '#007AFF' : '#f0f0f0',
              borderRadius: 12,
              maxWidth: '80%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Text style={{
              color: message.role === 'user' ? 'white' : '#333',
              fontSize: 16,
            }}>
              {message.content || 'No content'}
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginTop: 8 
            }}>
              <Text style={{
                color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#666',
                fontSize: 12,
              }}>
                {message.status.toUpperCase()}
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Invalid Date'}
              </Text>
              
                             {message.role === 'assistant' as any && (
                <Text style={{
                  color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : '#666',
                  fontSize: 12,
                }}>
                  Model: {message.model}
                </Text>
              )}
            </View>
            
                         {message.role === 'assistant' as any && message.status === 'processing' && (
              <Text 
                style={{ 
                  color: '#f44336', 
                  fontSize: 12, 
                  marginTop: 4,
                  textAlign: 'center'
                }}
                onPress={() => handleCancelMessage(message.id)}
              >
                Cancel
              </Text>
            )}
            
            {message.status === 'failed' && (
              <Text 
                style={{ 
                  color: '#007AFF', 
                  fontSize: 12, 
                  marginTop: 4,
                  textAlign: 'center'
                }}
                onPress={() => handleRetryMessage(message.id)}
              >
                Retry
              </Text>
            )}
            
            <Text style={{
              color: message.role === 'user' ? 'rgba(255,255,255,0.5)' : '#999',
              fontSize: 10,
              marginTop: 4,
            }}>
              ID: {message.id}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input area */}
      <View style={{
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              fontSize: 16,
            }}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Type your message..."
            multiline
            maxLength={2000}
          />
          <Text 
            style={{
              backgroundColor: isSending ? '#ccc' : '#007AFF',
              color: 'white',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              fontSize: 16,
            }}
            onPress={isSending ? undefined : handleSendMessage}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Text>
        </View>
        <Text style={{ 
          fontSize: 12, 
          color: '#666', 
          textAlign: 'right',
          marginTop: 4 
        }}>
          {inputValue.length}/2000
        </Text>
      </View>

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