// DTO for sending a message
export interface SendMessageDTO {
  content: string;
  roomId: number;
  userId: string;
  model: string;
  isSearchMode?: boolean;
}

export interface SendMessageResultDTO {
  userMessage: {
    id: string;
    content: string;
    timestamp: Date;
  };
  assistantMessage: {
    id: string;
    content: string;
    timestamp: Date;
  };
  success: boolean;
  error?: string;
}
