// Business layer interface - Port for chat room persistence
import { ChatRoom } from '../entities/ChatRoom';

export interface IChatRoomRepository {
  /**
   * Create a new chat room
   */
  createRoom(userId: string, model: string, title?: string): Promise<number>;
  
  /**
   * Get all chat rooms for a user
   */
  getUserRooms(userId: string): Promise<ChatRoom[]>;
  
  /**
   * Get a specific chat room by ID
   */
  getRoom(roomId: number, userId: string): Promise<ChatRoom | null>;
  
  /**
   * Update chat room title
   */
  updateRoomTitle(roomId: number, title: string, userId: string): Promise<boolean>;
  
  /**
   * Update chat room model
   */
  updateRoomModel(roomId: number, model: string, userId: string): Promise<boolean>;
  
  /**
   * Delete a chat room and all its messages
   */
  deleteRoom(roomId: number, userId: string): Promise<boolean>;
}
