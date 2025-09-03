// src/entities/chatRoom/model/types.ts

export interface ChatRoom {
  id: number;
  name: string;
}

export interface ChatRoomWithLastMsg {
  id: number;
  name: string;
  last_message?: string;
  last_activity?: string;
  updated_at?: string;
}

export interface ChatRoomDetails {
  id: number;
  name: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomUpdateData {
  name?: string;
  model?: string;
  updatedAt?: string;
}

export interface IChatRoomService {
  /**
   * Create a new chat room for the user
   */
  createRoom(userId: string, model: string): Promise<number | null>;

  /**
   * Update room metadata (name, model, timestamp)
   */
  updateRoom(roomId: number, updates: ChatRoomUpdateData): Promise<void>;

  /**
   * Get room information
   */
  getRoom(roomId: number): Promise<ChatRoomDetails | null>;

  /**
   * Delete a room and all its messages
   */
  deleteRoom(roomId: number): Promise<void>;
}
