import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { createChatStyles } from '../../../../app/chat/chat.styles';
import { useInputFocus } from '../../../shared/hooks';
import { supabase } from '../../../shared/lib/supabase';
import { ChatInput, MessageList } from '../../chat/components';
import { configureServices } from '../../chat/services/config/ServiceConfiguration';
import { ServiceFactory } from '../../chat/services/core';
import type { ChatMessage } from '../core/types';
import {
    toChatMessages
} from '../adapters/messageAdapter';
import { SendMessageCommand } from '../core/commands';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { EventBus } from '../core/events/EventBus';
import { useConcurrentChat } from '../core/hooks/useConcurrentChat';
import { useMessageCommands } from '../core/hooks/useMessageCommands';
import { useModelSelection } from '../core/hooks/useModelSelection';
import { ConcurrentAIService } from '../services/ConcurrentAIService';
import { ConcurrentMessageProcessor } from '../services/ConcurrentMessageProcessor';
import { ModelSelectionService } from '../services/ModelSelectionService';
import { IMessageProcessor } from '../core/types';

import { PersistenceService } from '../services/PersistenceService';
import { MESSAGE_EVENT_TYPES } from '../core/types/events';
import { EditingService } from '../features/editing/EditingService';
import { ModelSelector } from '../features/model-selection/components/ModelSelector';
import { RegenerationService } from '../features/regeneration/RegenerationService';

interface ConcurrentChatProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  onModelChangeBridge?: (apply: (model: string) => Promise<void>, currentModel: string) => void;
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
  showHeader = true,
  onModelChangeBridge,
}) => {
  try { console.log('[CHAT] mount', { roomId }); } catch {}
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
  const [hasSentFirst, setHasSentFirst] = useState(false);
  const historyLoadSeqRef = useRef(0);
  const [isHydrating, setIsHydrating] = useState(false);
  const { inputRef, maintainFocus } = useInputFocus();
  const firstUserMessageRef = useRef<string | null>(null);
  const activeRoomIdRef = useRef<number | null>(roomId ?? null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(roomId ?? null);
  
  // Get proven styles
  const styles = createChatStyles();

  // Core hooks with all advanced functionality (corrected parameter order)
  const { messages, updateMessage, replaceMessages, error } = useConcurrentChat(eventBus, serviceContainer, roomId);

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
    changeModel,
    setModelForRoom,
  } = useModelSelection(eventBus, serviceContainer, roomId);

  // Initialize additional services (session and feature services)
  useEffect(() => {
    const initializeAdditionalServices = async () => {
      try {
        // Ensure chat services are configured (idempotent)
        try { configureServices(); } catch {}

        // Register session from Supabase (needed by AI service)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          serviceContainer.register('session', session);
        }

        // Register feature services
        const regenerationService = new RegenerationService(eventBus, serviceContainer);
        const editingService = new EditingService(eventBus, serviceContainer);
        const persistenceService = new PersistenceService();

        serviceContainer.register('regenerationService', regenerationService);
        serviceContainer.register('editingService', editingService);
        serviceContainer.register('persistenceService', persistenceService);
        // Expose activeRoomId into container for processor to read (first-turn persistence)
        serviceContainer.register('activeRoomId', activeRoomIdRef.current ?? null);
        // streaming removed
        
      } catch (error) {
        // no-op
      }
    };

    initializeAdditionalServices();
  }, [serviceContainer, eventBus]);

  // Load chat history when roomId changes
  useEffect(() => {
    try { console.log('[NAV] concurrent-chat mount/useRoom', { roomId }); } catch {}
    const loadHistory = async () => {
      if (!roomId) return;
      const seq = ++historyLoadSeqRef.current;
      try { console.log('[HISTORY] load-start', { roomId }); } catch {}
      setIsHydrating(true);
      try {
        const messageService = ServiceFactory.createMessageService();
        const chatHistory = await messageService.loadMessages(roomId);
        try { console.log('[HISTORY] loaded', { roomId, seq, count: chatHistory?.length ?? 0 }); } catch {}
        // Map ChatMessage[] to ConcurrentMessage[] and hydrate
        const hydrated = (chatHistory as ChatMessage[]).map((m, idx) => ({
          id: `hist_${roomId}_${idx}`,
          role: m.role,
          content: m.content,
          status: 'completed' as const,
          timestamp: Date.now() - (chatHistory.length - idx) * 1000,
          roomId,
        }));
        // Replace local messages in one shot for clean hydration
        replaceMessages(hydrated);
        try {
          console.log('[HISTORY] hydrated', {
            roomId,
            seq,
            applied: seq === historyLoadSeqRef.current,
            len: hydrated.length,
            firstId: hydrated[0]?.id,
            lastId: hydrated[hydrated.length - 1]?.id,
          });
        } catch {}
      } catch (e) {
        try { console.log('[HISTORY] load-error', e); } catch {}
      } finally {
        setIsHydrating(false);
        try { console.log('[HISTORY] hydrating:false', { roomId, seq, currentSeq: historyLoadSeqRef.current }); } catch {}
      }
    };
    loadHistory();
    return () => { try { console.log('[NAV] concurrent-chat unmount/leaveRoom', { roomId }); } catch {} };
  }, [roomId, replaceMessages]);

  useEffect(() => {
    const welcome = !hasSentFirst && !isHydrating && messages.length === 0;
    try { console.log('[WELCOME] gate', { welcome, hasSentFirst, isHydrating, len: messages.length }); } catch {}
  }, [hasSentFirst, isHydrating, messages.length]);

  // Option A: Activate new room on ROOM_CREATED
  useEffect(() => {
    const subId = eventBus.subscribe(MESSAGE_EVENT_TYPES.ROOM_CREATED, (evt: any) => {
      const newId = evt?.roomId as number | undefined;
      if (!newId) return;
      activeRoomIdRef.current = newId;
      setActiveRoomId(newId);
      replaceMessages(messages.map(m => ({ ...m, roomId: newId })));
      try { console.log('[ROOM] activated', newId); } catch {}
    });
    return () => eventBus.unsubscribeById(subId);
  }, [eventBus, messages, replaceMessages]);

  // Command handlers using Command Pattern
  const handleSendMessage = useCallback(async () => {
    
    if (!inputValue.trim() || isSending) {
      return;
    }

    try {
      setIsSending(true);
      // Cache first user message for persistence if this is a new chat without roomId
      if (!roomId) {
        firstUserMessageRef.current = inputValue.trim();
      }

      // Get services
      const messageProcessor = serviceContainer.get<IMessageProcessor>('messageProcessor');
      const persistence = serviceContainer.get('persistenceService') as PersistenceService;
      const session = serviceContainer.get('session') as any;
      
      // Option D: Pre-create room if none active
      let targetRoomId = activeRoomIdRef.current || roomId || null;
      if (!targetRoomId) {
        try {
          const firstUserText = inputValue.trim();
          const createdId = await persistence.createRoom({ session, model: currentModel, initialName: firstUserText });
          activeRoomIdRef.current = createdId;
          setActiveRoomId(createdId);
          targetRoomId = createdId;
          try { console.log('[ROOM] pre-created', createdId); } catch {}
        } catch (e) {
          try { console.log('[ROOM] pre-create failed, sending temp'); } catch {}
        }
      }

      // Create and execute SendMessageCommand (processor, content, targetRoomId, context)
      const sendCommand = new SendMessageCommand(
        messageProcessor,
        inputValue.trim(),
        targetRoomId,
        messages
      );
      
      await executeCommand(sendCommand);
      if (!hasSentFirst) setHasSentFirst(true);
      
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
  }, [inputValue, isSending, hasSentFirst, executeCommand, serviceContainer, maintainFocus, roomId, currentModel, messages]);

  const handleModelChange = useCallback(async (newModel: string) => {
    try {
      console.log('[MODEL] UI → change requested', { newModel, currentModel, roomId });
      if (roomId) {
        await setModelForRoom(roomId, newModel);
      } else {
        await changeModel(newModel);
      }
      console.log('[MODEL] UI → change completed', { newModel });
    } catch (err) {
      Alert.alert(
        'Error',
        `Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  }, [changeModel, setModelForRoom, currentModel, roomId]);

  // Expose a bridge for parent header to control model selection
  useEffect(() => {
    if (!onModelChangeBridge) return;
    const apply = async (model: string) => {
      await handleModelChange(model);
    };
    onModelChangeBridge(apply, currentModel);
  }, [onModelChangeBridge, handleModelChange, currentModel]);

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
      console.log('[MODEL] Regenerate → using model', currentModel);
      const regeneratedMessage = await regenerationService.regenerateMessage(
        message.id,
        conversationHistory,
        currentModel
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
  }, [messages, serviceContainer, updateMessage, currentModel]);

  // Handle input change and track typing
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
  }, []);

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
      {showHeader && (
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
            currentRoomModel={currentModel}
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
      )}

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
        onUserEditRegenerate={async (userIndex: number, newText: string) => {
          try { console.log('[EDIT] send', { userIndex, newTextLen: newText?.length }); } catch {}
          const userMsg = messages[userIndex];
          if (!userMsg || userMsg.role !== 'user') return;
          updateMessage(userMsg.id, { content: newText });
          const assistantIndex = messages.findIndex((m, idx) => idx > userIndex && m.role === 'assistant');
          try { console.log('[EDIT] next assistant index', assistantIndex); } catch {}
          if (assistantIndex === -1) return;
          const assistantMsg = messages[assistantIndex];
          updateMessage(assistantMsg.id, { status: 'processing', content: '' });
          const history = messages.slice(0, assistantIndex).map((m, idx) => (idx === userIndex ? { ...m, content: newText } : m));
          try {
            const regenerationService = serviceContainer.get('regenerationService') as RegenerationService;
            const regenerated = await regenerationService.regenerateMessage(assistantMsg.id, history, currentModel);
            updateMessage(assistantMsg.id, { content: regenerated.content, status: 'completed' });
            try { console.log('[EDIT] done'); } catch {}
          } catch (e) {
            updateMessage(assistantMsg.id, { status: 'completed' });
            try { console.log('[EDIT] failed', e); } catch {}
          }
        }}
        showWelcomeText={!hasSentFirst && !isHydrating && messages.length === 0}
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