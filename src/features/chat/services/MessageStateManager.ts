// src/features/chat/services/MessageStateManager.ts
import React from 'react';
import { ChatMessage, MessageState } from '../types';

/**
 * Manages message state transitions in a centralized way
 * Implements a complete state machine for message lifecycle
 */
export class MessageStateManager {
  private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  
  constructor(setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) {
    this.setMessages = setMessages;
  }
  
  // === CORE STATE TRANSITIONS ===
  
  /**
   * Transition a message to a new state
   */
  transition(messageId: string, newState: MessageState): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, state: newState }
        : msg
    ));
  }
  
  /**
   * Create a new assistant message in loading state
   */
  createLoadingMessage(messageId: string): void {
    this.setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        state: 'loading',
        id: messageId
      }
    ]);
  }
  
  /**
   * Create a new user message in completed state
   */
  createUserMessage(messageId: string, content: string): void {
    this.setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content,
        state: 'completed',
        id: messageId
      }
    ]);
  }
  
  /**
   * Create both user and assistant messages atomically
   */
  createMessagePair(userMessageId: string, userContent: string, assistantMessageId: string): void {
    this.setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: userContent,
        state: 'completed',
        id: userMessageId
      },
      {
        role: 'assistant',
        content: '',
        state: 'loading',
        id: assistantMessageId
      }
    ]);
  }
  
  // === STREAMING SUPPORT ===
  
  /**
   * Update message content during streaming (stays in loading state)
   */
  updateStreamingContent(messageId: string, partialContent: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: partialContent, state: 'loading' }
        : msg
    ));
  }
  
  /**
   * Finish streaming and transition to animation state
   */
  finishStreamingAndAnimate(messageId: string, fullContent: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            content: '',
            fullContent,
            state: 'animating' 
          }
        : msg
    ));
  }
  
  /**
   * Set full content and transition to animating state (legacy compatibility)
   */
  setFullContentAndAnimate(messageId: string, fullContent: string): void {
    this.finishStreamingAndAnimate(messageId, fullContent);
  }
  
  // === REGENERATION SUPPORT ===
  
  /**
   * Unified method to handle message regeneration with clear state transitions
   * @param messageId The ID of the message to regenerate
   * @param newContent The new content for the message
   */
  handleRegeneration(messageId: string, newContent: string): void {
    
    
    // Phase 1: Set to loading state
    this.setMessages(prev => {
      
      return prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: '', fullContent: undefined, state: 'loading' }
          : msg
      );
    });

    // Phase 2: After a short delay, set content and transition to animating state
    
    setTimeout(() => {
      this.setMessages(prev => {
        
        return prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: '',
                fullContent: newContent,
                state: 'animating' 
              }
            : msg
        );
      });
      
    }, 50);
  }
  
  // === COMPLETION & ERROR HANDLING ===
  
  /**
   * Mark message as completed (animation finished)
   */
  markCompleted(messageId: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            state: 'completed',
            // Clear fullContent as it's no longer needed
            fullContent: undefined 
          }
        : msg
    ));
  }
  
  /**
   * Mark message as error with optional error content
   */
  markError(messageId: string, errorMessage?: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            content: errorMessage || 'An error occurred',
            state: 'error' 
          }
        : msg
    ));
  }
  
  // === BATCH OPERATIONS ===
  
  /**
   * Update multiple messages in a single operation (performance optimization)
   */
  batchUpdate(updates: { messageId: string; changes: Partial<ChatMessage> }[]): void {
    this.setMessages(prev => prev.map(msg => {
      const update = updates.find(u => u.messageId === msg.id);
      return update ? { ...msg, ...update.changes } : msg;
    }));
  }
  
  // === UTILITY METHODS ===
  
  /**
   * Find a message by ID
   */
  findMessage(messageId: string, messages: ChatMessage[]): ChatMessage | undefined {
    return messages.find(msg => msg.id === messageId);
  }
  
  /**
   * Check if a message is in a specific state
   */
  isMessageInState(messageId: string, state: MessageState, messages: ChatMessage[]): boolean {
    const message = this.findMessage(messageId, messages);
    return message?.state === state;
  }
  
  /**
   * Get all messages in a specific state
   */
  getMessagesInState(state: MessageState, messages: ChatMessage[]): ChatMessage[] {
    return messages.filter(msg => msg.state === state);
  }
}
