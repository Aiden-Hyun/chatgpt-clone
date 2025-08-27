// Chat Feature - Persistence Layer
export { MessageRepository } from './repositories/MessageRepository';
export { ChatRoomRepository } from './repositories/ChatRoomRepository';
export { AIProvider } from './adapters/AIProvider';
export { ClipboardAdapter } from './adapters/ClipboardAdapter';
export { SupabaseChatRoomAdapter } from './adapters/SupabaseChatRoomAdapter';
export { MessageMapper } from './mappers/MessageMapper';
export { ChatRoomMapper } from './mappers/ChatRoomMapper';

// Types
export type { SaveMessageResult, GetMessagesResult } from './repositories/MessageRepository';
export type { CreateRoomResult, UpdateRoomResult, DeleteRoomResult } from './repositories/ChatRoomRepository';
export type { AIResponse, AIMessageParams } from './adapters/AIProvider';
export type { ClipboardResult } from './adapters/ClipboardAdapter';
export type { RoomData, RoomUpdateData, RoomWithLastMessage } from './adapters/SupabaseChatRoomAdapter';
export type { MessageData } from './mappers/MessageMapper';
export type { ChatRoomData } from './mappers/ChatRoomMapper';
