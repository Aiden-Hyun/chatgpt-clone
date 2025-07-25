// src/features/chat/services/interfaces/IStorageService.ts
import { ChatMessage } from '../types';

export interface IStorageService {
  /**
   * Store messages for a room
   */
  storeMessages(roomId: number, messages: ChatMessage[]): Promise<void>;
  
  /**
   * Retrieve messages for a room
   */
  getMessages(roomId: number): Promise<ChatMessage[] | null>;
  
  /**
   * Store model selection for a room
   */
  storeModel(roomId: number, model: string): Promise<void>;
  
  /**
   * Get stored model for a room
   */
  getModel(roomId: number): Promise<string | null>;
  
  /**
   * Store a flag indicating a newly created room
   */
  markAsNewRoom(roomId: number): Promise<void>;
  
  /**
   * Check if a room is newly created
   */
  isNewRoom(roomId: number): Promise<boolean>;
  
  /**
   * Clear all data for a room
   */
  clearRoomData(roomId: number): Promise<void>;
} 