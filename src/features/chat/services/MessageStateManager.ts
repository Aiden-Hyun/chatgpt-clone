// src/features/chat/services/MessageStateManager.ts
import React from 'react';
import { ChatMessage, MessageState } from '../types';

/**
 * Manages message state transitions in a centralized way
 */
export class MessageStateManager {
  private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  
  constructor(setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>) {
    this.setMessages = setMessages;
  }
  
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
   * Set full content and transition to animating state
   */
  setFullContentAndAnimate(messageId: string, fullContent: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            fullContent,
            content: fullContent, // Also update regular content
            state: 'animating' 
          }
        : msg
    ));
  }
  
  /**
   * Mark message as completed (animation finished)
   */
  markCompleted(messageId: string): void {
    this.transition(messageId, 'completed');
  }
  
  /**
   * Mark message as error
   */
  markError(messageId: string): void {
    this.transition(messageId, 'error');
  }
}
