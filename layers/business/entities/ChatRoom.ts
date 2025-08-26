// Business entity - Domain model for chat rooms
export interface ChatRoom {
  id: number;
  userId: string;
  title?: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatRoomEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly model: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly title?: string
  ) {}

  static fromJSON(data: any): ChatRoomEntity {
    return new ChatRoomEntity(
      data.id,
      data.userId,
      data.model,
      data.createdAt ? new Date(data.createdAt) : new Date(),
      data.updatedAt ? new Date(data.updatedAt) : new Date(),
      data.title
    );
  }

  toJSON(): ChatRoom {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      model: this.model,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  withTitle(title: string): ChatRoomEntity {
    return new ChatRoomEntity(
      this.id,
      this.userId,
      this.model,
      this.createdAt,
      new Date(), // Update timestamp
      title
    );
  }

  withModel(model: string): ChatRoomEntity {
    return new ChatRoomEntity(
      this.id,
      this.userId,
      model,
      this.createdAt,
      new Date(), // Update timestamp
      this.title
    );
  }

  getDisplayTitle(): string {
    return this.title || `Chat ${this.id}`;
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
