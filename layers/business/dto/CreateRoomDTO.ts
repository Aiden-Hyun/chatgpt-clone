// DTO for creating a chat room
export interface CreateRoomDTO {
  userId: string;
  model: string;
  title?: string;
}

export interface CreateRoomResultDTO {
  roomId: number;
  title?: string;
  model: string;
  createdAt: Date;
  success: boolean;
  error?: string;
}
