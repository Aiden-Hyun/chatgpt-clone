// Chat-related interfaces and types for persistence layer

// AI Provider interfaces
export interface AIResponse {
  content: string;
  role: 'assistant' | 'user' | 'system';
  timestamp: Date;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIMessageParams {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIProvider {
  sendMessage(params: AIMessageParams): Promise<AIResponse>;
  getModels(): Promise<string[]>;
}

// Clipboard adapter interfaces
export interface ClipboardResult {
  success: boolean;
  error?: string;
}

export interface IClipboardAdapter {
  copy(text: string): Promise<ClipboardResult>;
  paste(): Promise<{ success: boolean; text?: string; error?: string }>;
  hasString(): Promise<{ success: boolean; hasString?: boolean; error?: string }>;
}

// Chat room repository interfaces
export interface CreateRoomResult {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export interface UpdateRoomResult {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export interface DeleteRoomResult {
  success: boolean;
  error?: string;
}

export interface IChatRoomRepository {
  create(room: Partial<ChatRoom>): Promise<CreateRoomResult>;
  update(id: string, updates: Partial<ChatRoom>): Promise<UpdateRoomResult>;
  delete(id: string): Promise<DeleteRoomResult>;
  getById(id: string): Promise<{ success: boolean; room?: ChatRoom; error?: string }>;
  getByUserId(userId: string): Promise<{ success: boolean; rooms?: ChatRoom[]; error?: string }>;
}

// Message repository interfaces
export interface IMessageRepository {
  create(message: Partial<Message>): Promise<{ success: boolean; message?: Message; error?: string }>;
  update(id: string, updates: Partial<Message>): Promise<{ success: boolean; message?: Message; error?: string }>;
  delete(id: string): Promise<{ success: boolean; error?: string }>;
  getById(id: string): Promise<{ success: boolean; message?: Message; error?: string }>;
  getByRoomId(roomId: string): Promise<{ success: boolean; messages?: Message[]; error?: string }>;
}

// Chat room entity
export interface ChatRoom {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  isArchived?: boolean;
}

// Message entity
export interface Message {
  id: string;
  roomId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Mapper interfaces
export interface IChatRoomMapper {
  toEntity(dbRoom: unknown): ChatRoom;
  toDatabase(room: ChatRoom): unknown;
}

export interface IMessageMapper {
  toEntity(dbMessage: unknown): Message;
  toDatabase(message: Message): unknown;
}

// Supabase adapter interfaces
export interface RoomData {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  is_archived?: boolean;
}

export interface RoomUpdateData {
  name?: string;
  is_archived?: boolean;
  last_message_at?: string;
}

export interface RoomWithLastMessage extends RoomData {
  last_message?: {
    content: string;
    role: string;
    timestamp: string;
  };
}

export interface ISupabaseChatRoomAdapter {
  createRoom(data: Omit<RoomData, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; room?: RoomData; error?: string }>;
  updateRoom(id: string, data: RoomUpdateData): Promise<{ success: boolean; room?: RoomData; error?: string }>;
  deleteRoom(id: string): Promise<{ success: boolean; error?: string }>;
  getRoom(id: string): Promise<{ success: boolean; room?: RoomData; error?: string }>;
  getRoomsByUserId(userId: string): Promise<{ success: boolean; rooms?: RoomData[]; error?: string }>;
}

export interface SaveResult {
  success: boolean;
  data?: MessageData;
  error?: string;
}

export interface SaveMessageResult {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface GetMessagesResult {
  success: boolean;
  data?: MessageData[];
  error?: string;
}

// Database message types
export interface MessageData {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  room_id: string;
  user_id?: string;
  is_deleted: boolean;
  metadata?: string;
}

export interface ChatRoomData {
  id: string; // Domain uses string, adapter uses number
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  lastActivity?: Date;
}
export interface DatabaseMessage {
  id: string;
  room_id: string;
  content: string;
  role: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MessageDTO {
  id: string;
  roomId: string;
  content: string;
  role: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ISupabaseMessageAdapter {
  saveMessage(message: Partial<Message>): Promise<SaveResult>;
  getMessages(roomId: string): Promise<GetMessagesResult>;
  updateMessage(id: string, updates: Partial<Message>): Promise<{ success: boolean; error?: string }>;
  deleteMessage(id: string): Promise<{ success: boolean; error?: string }>;
}

