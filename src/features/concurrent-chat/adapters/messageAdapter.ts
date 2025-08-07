import { ChatMessage } from '../../chat/types';
import { ConcurrentMessage } from '../core/types/interfaces/IMessageProcessor';

/**
 * Message Adapter
 * Converts between ConcurrentMessage and ChatMessage interfaces
 * to enable reuse of existing proven UI components
 */

export const toChatMessage = (msg: ConcurrentMessage, index: number): ChatMessage => ({
  role: msg.role,
  content: msg.status === 'processing' ? '' : (msg.content || ''), // Empty content for processing messages
  // Add index for regeneration tracking
  index,
});

export const toConcurrentMessage = (msg: ChatMessage, id?: string): ConcurrentMessage => ({
  id: id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  role: msg.role,
  content: msg.content,
  status: 'completed',
  timestamp: Date.now(),
  model: 'gpt-3.5-turbo', // Default model
});

/**
 * Convert concurrent messages array to chat messages array
 */
export const toChatMessages = (messages: ConcurrentMessage[]): ChatMessage[] => {
  return messages.map((msg, index) => toChatMessage(msg, index));
};

/**
 * Map concurrent regenerating message IDs to indices for existing UI
 */
export const mapRegeneratingIds = (
  regeneratingIds: Set<string>, 
  messages: ConcurrentMessage[]
): Set<number> => {
  const indices = new Set<number>();
  
  regeneratingIds.forEach(id => {
    const index = messages.findIndex(msg => msg.id === id);
    if (index !== -1) {
      indices.add(index);
    }
  });
  
  return indices;
};

/**
 * Check if any message is currently processing (for loading state)
 */
export const hasProcessingMessages = (messages: ConcurrentMessage[]): boolean => {
  return messages.some(msg => msg.status === 'processing' || msg.status === 'pending');
};