import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { createChatStyles } from '../../../../app/chat/chat.styles';
import { useInputFocus } from '../../../shared/hooks';
import { supabase } from '../../../shared/lib/supabase';
import { ChatInput, MessageList } from '../../chat/components';
import {
    toChatMessages
} from '../adapters/messageAdapter';
import { ChangeModelCommand } from '../core/commands/ChangeModelCommand';
import { SendMessageCommand } from '../core/commands/SendMessageCommand';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { EventBus } from '../core/events/EventBus';
import { useConcurrentChat } from '../core/hooks/useConcurrentChat';
import { useMessageCommands } from '../core/hooks/useMessageCommands';
import { useModelSelection } from '../core/hooks/useModelSelection';
import { ConcurrentAIService } from '../core/services/ConcurrentAIService';
import { ConcurrentMessageProcessor } from '../core/services/ConcurrentMessageProcessor';
import { ModelSelectionService } from '../core/services/ModelSelectionService';
import { IMessageProcessor } from '../core/types/interfaces/IMessageProcessor';
import { IModelSelector } from '../core/types/interfaces/IModelSelector';

import { EditingService } from '../features/editing/EditingService';
import { ModelSelector } from '../features/model-selection/components/ModelSelector';
import { RegenerationService } from '../features/regeneration/RegenerationService';
import { StreamingService } from '../features/streaming/StreamingService';

interface ConcurrentChatProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
}

/**
 * ConcurrentChat - Main container component for concurrent chat functionality
 * 
 * This component orchestrates all concurrent chat features using the SOLID architecture
 * while using the proven UI components from the existing chat system.
 * 
 * Architecture:
 * - Uses proven ChatInput, MessageList components for UI
 * - Maintains all advanced features: Command Pattern, Services, Plugins
 * - Adapts between ConcurrentMessage and ChatMessage interfaces
 * 
 * Features:
 * - Concurrent message sending without blocking UI
 * - Real-time message updates and streaming
 * - Plugin-based extensibility
 * - Model selection and switching
 * - Error handling and retry mechanisms
 * - Command pattern for all actions
 * - Beautiful, proven UI from existing chat
 */
export const ConcurrentChat: React.FC<ConcurrentChatProps> = ({
  roomId,
  initialModel = 'gpt-3.5-turbo',
  className,
}) => {
  // Dependency injection container and event bus - initialize services immediately
  const [eventBus] = useState(() => new EventBus());
  const [serviceContainer] = useState(() => {
    const container = new ServiceContainer();
    
    // Register core services synchronously before hooks run
    
    const aiService = new ConcurrentAIService();
    const messageProcessor = new ConcurrentMessageProcessor(eventBus, container);
    const modelSelector = new ModelSelectionService(supabase);
    
    container.register('aiService', aiService);
    container.register('messageProcessor', messageProcessor);
    container.register('modelSelector', modelSelector);
    
    
    return container;
  });
  
  // UI state
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const { inputRef, maintainFocus } = useInputFocus();
  
  // Get proven styles
  const styles = createChatStyles();

  // Core hooks with all advanced functionality (corrected parameter order)
  const { messages, updateMessage } = useConcurrentChat(eventBus, serviceContainer, roomId);

  const {
    executeCommand,
    undoLastCommand,
    canUndo,
    getHistoryCount,
  } = useMessageCommands(eventBus, serviceContainer);

  // Plugin system removed; keep placeholder values
  const plugins: any[] = [];

  const {
    currentModel,
    availableModels,
  } = useModelSelection(eventBus, serviceContainer, roomId);

  // Initialize additional services (session and feature services)
  useEffect(() => {
    const initializeAdditionalServices = async () => {
      try {
        // Register session from Supabase (needed by AI service)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          serviceContainer.register('session', session);
        }

        // Register feature services
        const regenerationService = new RegenerationService(eventBus, serviceContainer);
        const editingService = new EditingService(eventBus, serviceContainer);
        const streamingService = new StreamingService(eventBus, serviceContainer);

        serviceContainer.register('regenerationService', regenerationService);
        serviceContainer.register('editingService', editingService);
        serviceContainer.register('streamingService', streamingService);
        
      } catch (error) {
        // no-op
      }
    };

    initializeAdditionalServices();
  }, [serviceContainer, eventBus]);

  // Command handlers using Command Pattern
  const handleSendMessage = useCallback(async () => {
    
    if (!inputValue.trim() || isSending) {
      return;
    }

    try {
      setIsSending(true);
      if (!hasUserTyped) setHasUserTyped(true);

      // Get message processor from service container
      const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
      
      // Create and execute SendMessageCommand (correct signature: processor, content, roomId)
      const sendCommand = new SendMessageCommand(
        messageProcessor,
        inputValue.trim(),
        roomId || null
      );
      
      await executeCommand(sendCommand);
      
      // Clear input after successful send
      setInputValue('');
      maintainFocus();
    } catch (err) {
      
      Alert.alert(
        'Error',
        `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, hasUserTyped, executeCommand, serviceContainer, maintainFocus, roomId]);

  const handleModelChange = useCallback(async (newModel: string) => {
    try {
      const modelSelector = serviceContainer.get<IModelSelector>('modelSelector');
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

  // Handle regeneration using existing services
  const handleRegenerate = useCallback(async (index: number) => {
    const message = messages[index];
    if (!message || message.role !== 'assistant') return;

    try {
      // Mark message as processing to show loading state during regeneration
      updateMessage(message.id, { status: 'processing', content: '' });

      // Get regeneration service
      const regenerationService = serviceContainer.get('regenerationService') as RegenerationService;
      
      // Get conversation history up to this point
      const conversationHistory = messages.slice(0, index);
      
      // Regenerate the message
      const regeneratedMessage = await regenerationService.regenerateMessage(
        message.id, 
        conversationHistory
      );
      
      // Update the message in state
      updateMessage(message.id, {
        content: regeneratedMessage.content,
        status: 'completed'
      });
    } catch (error) {
      
      Alert.alert(
        'Error',
        `Failed to regenerate message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
      // Restore to previous state if needed
      updateMessage(message.id, { status: 'completed' });
    }
  }, [messages, serviceContainer, updateMessage]);

  // Handle input change and track typing
  const handleInputChange = useCallback((text: string) => {
    if (text.length > 0 && !hasUserTyped) {
      setHasUserTyped(true);
    }
    setInputValue(text);
  }, [hasUserTyped]);

  // Convert concurrent state to chat component props
  const chatMessages = toChatMessages(messages);
  
  // Map concurrent message states to existing UI animation states
  // isNewMessageLoading: false because we handle processing messages in our own state
  const isNewMessageLoading = false;
  
  // regeneratingIndices: set of indices for messages being regenerated OR processing
  const regeneratingIndices = new Set<number>();
  messages.forEach((msg, index) => {
    if (msg.role === 'assistant' && (msg.status === 'processing' || msg.status === 'pending')) {
      regeneratingIndices.add(index);
      // console.log(`🎬 [Animation] Added index ${index} to regeneratingIndices for message:`, { id: msg.id, role: msg.role, status: msg.status });
    }
  });
  
  // Animation states for debugging (commented out to reduce log noise)
  // console.log('🎬 [Animation] States:', {
  //   isNewMessageLoading,
  //   regeneratingIndices: Array.from(regeneratingIndices),
  //   messagesCount: messages.length,
  //   processingMessages: messages.filter(m => m.status === 'processing').map(m => ({ id: m.id, role: m.role, content: m.content })),
  //   allMessages: messages.map(m => ({ id: m.id, role: m.role, status: m.status, content: m.content?.substring(0, 20) }))
  // });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
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
          {/* Model Selector */}
          <ModelSelector
            currentModel={currentModel}
            availableModels={availableModels}
            onModelChange={handleModelChange}
          />
          
          {/* Undo button */}
          {canUndo() && (
            <Text 
              style={{ 
                marginLeft: 12,
                color: '#007AFF', 
                fontSize: 14,
                padding: 4
              }}
              onPress={undoLastCommand}
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

      {/* Messages using proven MessageList component */}
      <MessageList
        messages={chatMessages}
        isNewMessageLoading={isNewMessageLoading}
        regeneratingIndices={regeneratingIndices}
        onRegenerate={handleRegenerate}
        showWelcomeText={!hasUserTyped}
      />

      {/* Input using proven ChatInput component */}
      <ChatInput
        input={inputValue}
        onChangeText={handleInputChange}
        onSend={handleSendMessage}
        sending={isSending}
        inputRef={inputRef}
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
    </KeyboardAvoidingView>
  );
};