// src/features/chat/services/interfaces/INavigationService.ts
import { ChatMessage } from '../types';

export interface INavigationService {
  /**
   * Navigate to a specific chat room
   */
  navigateToRoom(roomId: number): Promise<void>;
  
  /**
   * Navigate to home/rooms list
   */
  navigateToHome(): Promise<void>;
  
  /**
   * Navigate to a new chat
   */
  navigateToNewChat(): Promise<void>;
  
  /**
   * Handle navigation after creating a new room
   */
  handleNewRoomNavigation(roomId: number, userMsg: ChatMessage, fullContent: string, model: string): Promise<void>;
} 