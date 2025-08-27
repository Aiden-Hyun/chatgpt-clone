// Business Layer - Chat Feature
// Exports for external use

// Entities
export { ChatRoom } from './entities/ChatRoom';
export { MessageEntity, MessageRole } from './entities/Message';

// Interfaces
export type { AIMessageParams, AIResponse, IAIProvider } from './interfaces/IAIProvider';
export type { CreateRoomResult, DeleteRoomResult, IChatRoomRepository, UpdateRoomResult } from './interfaces/IChatRoomRepository';
export type { ClipboardResult, IClipboardAdapter } from './interfaces/IClipboardAdapter';
export type { IMessageRepository, SaveMessageResult } from './interfaces/IMessageRepository';

// Use Cases
export { CopyMessageUseCase } from './use-cases/CopyMessageUseCase';
export { CreateRoomUseCase } from './use-cases/CreateRoomUseCase';
export { DeleteMessageUseCase } from './use-cases/DeleteMessageUseCase';
export { DeleteRoomUseCase } from './use-cases/DeleteRoomUseCase';
export { ListRoomsUseCase } from './use-cases/ListRoomsUseCase';
export { ReceiveMessageUseCase } from './use-cases/ReceiveMessageUseCase';
export { SendMessageUseCase } from './use-cases/SendMessageUseCase';
export { UpdateRoomUseCase } from './use-cases/UpdateRoomUseCase';

// View Models
export { useChatRoomViewModel } from './view-models/useChatRoomViewModel';
export { useChatViewModel } from './view-models/useChatViewModel';
