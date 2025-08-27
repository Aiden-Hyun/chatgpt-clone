export interface AIMessageParams {
  content: string;
  roomId: string;
  model?: string;
  accessToken: string;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  tokens?: number;
  processingTime?: number;
  error?: string;
}

export interface IAIProvider {
  sendMessage(params: AIMessageParams): Promise<AIResponse>;
}
