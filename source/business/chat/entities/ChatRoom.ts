export interface ChatRoom {
  id: string;
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messageCount: number;
  lastMessage?: string;
  lastActivity?: Date;
}

export class ChatRoomEntity implements ChatRoom {
  id: string;
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messageCount: number;
  lastMessage?: string;
  lastActivity?: Date;

  constructor(params: {
    id: string;
    name: string;
    model: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    messageCount?: number;
    lastMessage?: string;
    lastActivity?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.model = params.model;
    this.userId = params.userId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.isActive = params.isActive ?? true;
    this.messageCount = params.messageCount || 0;
    this.lastMessage = params.lastMessage;
    this.lastActivity = params.lastActivity;
  }

  // Business methods
  updateLastMessage(messageId: string, timestamp: Date): void {
    this.lastMessage = messageId;
    this.lastActivity = timestamp;
    this.updatedAt = new Date();
    this.messageCount++;
  }

  incrementMessageCount(): void {
    this.messageCount++;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  updateName(newName: string): void {
    this.name = newName;
    this.updatedAt = new Date();
  }

  getDisplayName(): string {
    return this.name || 'New Chat';
  }

  isRecent(): boolean {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.updatedAt > oneDayAgo;
  }
}
