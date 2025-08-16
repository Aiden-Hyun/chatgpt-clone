// src/features/chat/services/interfaces/INavigationService.ts

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
} 