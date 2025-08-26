// Business entity - Domain model for chat messages
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  isAnimating?: boolean;
  error?: string;
}

export class ChatMessageEntity {
  constructor(
    public readonly id: string,
    public readonly role: 'user' | 'assistant' | 'system',
    public readonly content: string,
    public readonly timestamp: Date = new Date(),
    public readonly isLoading: boolean = false,
    public readonly isAnimating: boolean = false,
    public readonly error?: string
  ) {}

  static fromJSON(data: any): ChatMessageEntity {
    return new ChatMessageEntity(
      data.id,
      data.role,
      data.content,
      data.timestamp ? new Date(data.timestamp) : new Date(),
      data.isLoading || false,
      data.isAnimating || false,
      data.error
    );
  }

  toJSON(): ChatMessage {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      timestamp: this.timestamp,
      isLoading: this.isLoading,
      isAnimating: this.isAnimating,
      error: this.error
    };
  }

  withLoading(isLoading: boolean): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      isLoading,
      this.isAnimating,
      this.error
    );
  }

  withAnimating(isAnimating: boolean): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      this.isLoading,
      isAnimating,
      this.error
    );
  }

  withError(error?: string): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      this.content,
      this.timestamp,
      this.isLoading,
      this.isAnimating,
      error
    );
  }

  withContent(content: string): ChatMessageEntity {
    return new ChatMessageEntity(
      this.id,
      this.role,
      content,
      this.timestamp,
      this.isLoading,
      this.isAnimating,
      this.error
    );
  }
}
