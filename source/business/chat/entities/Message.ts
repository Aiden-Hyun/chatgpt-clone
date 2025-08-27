export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  roomId: string;
  userId?: string;
  isDeleted: boolean;
  metadata?: MessageMetadata;
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  processingTime?: number;
  error?: string;
  isEdited?: boolean;
  editedAt?: Date;
  replyToMessageId?: string;
  supersededByMessageId?: string;
}

export class MessageEntity implements Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  roomId: string;
  userId?: string;
  isDeleted: boolean;
  metadata?: MessageMetadata;

  constructor(params: {
    id: string;
    content: string;
    role: MessageRole;
    roomId: string;
    userId?: string;
    timestamp?: Date;
    isDeleted?: boolean;
    metadata?: MessageMetadata;
  }) {
    this.id = params.id;
    this.content = params.content;
    this.role = params.role;
    this.roomId = params.roomId;
    this.userId = params.userId;
    this.timestamp = params.timestamp || new Date();
    this.isDeleted = params.isDeleted || false;
    this.metadata = params.metadata;
  }

  // Business methods
  isUserMessage(): boolean {
    return this.role === MessageRole.USER;
  }

  isAssistantMessage(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }

  isSystemMessage(): boolean {
    return this.role === MessageRole.SYSTEM;
  }

  markAsDeleted(): void {
    this.isDeleted = true;
  }

  restore(): void {
    this.isDeleted = false;
  }

  updateContent(newContent: string): void {
    this.content = newContent;
    this.timestamp = new Date();
  }

  addMetadata(metadata: Partial<MessageMetadata>): void {
    this.metadata = { ...this.metadata, ...metadata };
  }

  getDisplayContent(): string {
    return this.isDeleted ? '[Message deleted]' : this.content;
  }

  canBeDeleted(): boolean {
    return !this.isSystemMessage() && !this.isDeleted;
  }

  canBeCopied(): boolean {
    return !this.isDeleted && this.content.length > 0;
  }

  editContent(newContent: string): void {
    this.content = newContent;
    this.metadata = {
      ...this.metadata,
      isEdited: true,
      editedAt: new Date()
    };
  }

  canBeEdited(userId: string): boolean {
    return this.isUserMessage() && this.userId === userId && !this.isDeleted;
  }

  markAsSuperseded(supersededByMessageId: string): void {
    this.metadata = {
      ...this.metadata,
      supersededByMessageId
    };
  }

  linkToUserMessage(replyToMessageId: string): void {
    this.metadata = {
      ...this.metadata,
      replyToMessageId
    };
  }

  isEdited(): boolean {
    return this.metadata?.isEdited === true;
  }

  isSuperseded(): boolean {
    return !!this.metadata?.supersededByMessageId;
  }
}
