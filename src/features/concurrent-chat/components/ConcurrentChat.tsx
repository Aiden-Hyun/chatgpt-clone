import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { supabase } from '../../../shared/lib/supabase';
import { CancelMessageCommand } from '../core/commands/CancelMessageCommand';
import { ChangeModelCommand } from '../core/commands/ChangeModelCommand';
import { ClearMessagesCommand } from '../core/commands/ClearMessagesCommand';
import { RetryMessageCommand } from '../core/commands/RetryMessageCommand';
import { SendMessageCommand } from '../core/commands/SendMessageCommand';
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
import { AnimationService } from '../features/animation/AnimationService';
import { AnimatedMessage } from '../features/animation/components/AnimatedMessage';
import { EditableMessage } from '../features/editing/components/EditableMessage';
import { EditingService } from '../features/editing/EditingService';
import { ModelSelector } from '../features/model-selection/components/ModelSelector';
import { RegenerateButton } from '../features/regeneration/components/RegenerateButton';
import { RegenerationService } from '../features/regeneration/RegenerationService';
import { StreamingIndicator } from '../features/streaming/components/StreamingIndicator';
import { StreamingService } from '../features/streaming/StreamingService';

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
    
    // Register feature services
    const animationService = new AnimationService(eventBus, container);
    const regenerationService = new RegenerationService(eventBus, container);
    const editingService = new EditingService(eventBus, container);
    const streamingService = new StreamingService(eventBus, container);
    
    container.register('animationService', animationService);
    container.register('regenerationService', regenerationService);
    container.register('editingService', editingService);
    container.register('streamingService', streamingService);

    const mockMessageProcessor: IMessageProcessor = {
      process: async (message: any) => {
        // Mock message processor for demo
        
        try {
          // 1. Ensure message has correct role and update to processing (API call starting)
          const userMessageWithRole = {
            ...message,
            role: 'user' as const,
            status: 'processing' as const
          };
          
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
    updateMessage,
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

  // Register session on component mount
  useEffect(() => {
    const registerSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          serviceContainer.register('session', session);
          console.log('Session registered in service container');
        } else {
          console.warn('No session found - some features may not work');
        }
      } catch (error) {
        console.error('Failed to register session:', error);
      }
    };

    registerSession();
  }, [serviceContainer]);

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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header with model selector and controls */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ 
          paddingTop: 16,
          paddingBottom: 16,
          minHeight: '100%' 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Message count and clear button */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#F8F9FA',
          borderRadius: 12,
          marginHorizontal: 16
        }}>
          <Text style={{ fontSize: 14, color: '#6C757D', fontWeight: '500' }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Text>
          {messages.length > 0 && (
            <Text 
              style={{ 
                color: '#007AFF', 
                fontSize: 14,
                fontWeight: '600',
                paddingVertical: 4,
                paddingHorizontal: 8
              }}
              onPress={handleClearMessages}
            >
              Clear All
            </Text>
          )}
        </View>

        {/* Messages */}
        {messages.map((message, index) => {
          const isUserMessage = message.role === 'user';
          return (
            <View key={message.id || index}>
              <AnimatedMessage
                messageId={message.id}
                content={message.content || 'No content'}
                role={message.role as 'user' | 'assistant'}
                status={message.status as 'pending' | 'processing' | 'completed' | 'failed'}
                eventBus={eventBus}
                serviceContainer={serviceContainer}
              />
              
              {/* Action buttons for assistant messages */}
              {!isUserMessage && message.status === 'completed' && (
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'flex-start', 
                  marginTop: 8,
                  marginBottom: 4,
                  paddingHorizontal: 16,
                  gap: 12,
                }}>
                  {/* Regenerate Button */}
                  <RegenerateButton
                    messageId={message.id}
                    originalContent={message.content}
                    conversationHistory={(() => {
                      const history = messages.slice(0, index);
                      console.log('🔄 [CONCURRENT_CHAT] Conversation history for regeneration:', {
                        messageIndex: index,
                        totalMessages: messages.length,
                        historyLength: history.length,
                        history: history.map(m => ({ id: m.id, role: m.role, content: m.content?.substring(0, 50) + '...' }))
                      });
                      return history;
                    })()}
                    eventBus={eventBus}
                    serviceContainer={serviceContainer}
                    size="small"
                    variant="outline"
                    onRegenerationComplete={(newContent) => {
                      console.log('🎯 onRegenerationComplete callback triggered!');
                      console.log('📝 newContent received:', newContent);
                      console.log('🔍 Current message.id:', message.id);
                      
                      // Update the message content in the UI
                      console.log('🔄 Calling updateMessage for messageId:', message.id);
                      updateMessage(message.id, { 
                        content: newContent 
                      });
                      console.log('✅ updateMessage called successfully');
                    }}
                  />
                  
                  {/* Edit Button */}
                  <EditableMessage
                    messageId={message.id}
                    originalContent={message.content}
                    role={message.role as 'user' | 'assistant'}
                    eventBus={eventBus}
                    serviceContainer={serviceContainer}
                    maxLength={2000}
                    onEditComplete={(newContent) => {
                      console.log('Message edited:', newContent);
                    }}
                  />
                </View>
              )}
              
              {!isUserMessage && message.status === 'processing' && (
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  marginTop: 8,
                  paddingHorizontal: 8,
                }}>
                  <StreamingIndicator
                    messageId={message.id}
                    eventBus={eventBus}
                    serviceContainer={serviceContainer}
                    variant="dots"
                    size="small"
                    color="#007AFF"
                  />
                  <Text 
                    style={{ 
                      color: '#f44336', 
                      fontSize: 12, 
                      marginTop: 4
                    }}
                    onPress={() => handleCancelMessage(message.id)}
                  >
                    Cancel
                  </Text>
                </View>
              )}
              
              {message.status === 'failed' && (
                <View style={{ 
                  marginTop: 8,
                  alignItems: 'center',
                }}>
                  <Text 
                    style={{ 
                      color: '#007AFF', 
                      fontSize: 12
                    }}
                    onPress={() => handleRetryMessage(message.id)}
                  >
                    Retry
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
          alignItems: 'flex-end',
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 8,
              fontSize: 16,
              maxHeight: 100,
              textAlignVertical: 'top',
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
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 20,
              fontSize: 16,
              fontWeight: '600',
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