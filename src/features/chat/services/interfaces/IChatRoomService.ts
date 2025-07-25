// src/features/chat/services/interfaces/IChatRoomService.ts

export interface IChatRoomService {
  /**
   * Create a new chat room for the user
   */
  createRoom(userId: string, model: string): Promise<number | null>;
  
  /**
   * Update room metadata (name, model, timestamp)
   */
  updateRoom(roomId: number, updates: {
    name?: string;
    model?: string;
    updatedAt?: string;
  }): Promise<void>;
  
  /**
   * Get room information
   */
  getRoom(roomId: number): Promise<{
    id: number;
    name: string;
    model: string;
    createdAt: string;
    updatedAt: string;
  } | null>;
  
  /**
   * Delete a room and all its messages
   */
  deleteRoom(roomId: number): Promise<void>;
} 