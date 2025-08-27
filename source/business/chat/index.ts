// Chat Feature - Business Layer
export { MessageEntity, Message, MessageRole, MessageMetadata } from './entities/Message';
export { ChatRoomEntity, ChatRoom } from './entities/ChatRoom';

export { SendMessageUseCase } from './use-cases/SendMessageUseCase';
export { ReceiveMessageUseCase } from './use-cases/ReceiveMessageUseCase';
export { DeleteMessageUseCase } from './use-cases/DeleteMessageUseCase';
export { CopyMessageUseCase } from './use-cases/CopyMessageUseCase';

// Room Management Use Cases
export { CreateRoomUseCase } from './use-cases/CreateRoomUseCase';
export { UpdateRoomUseCase } from './use-cases/UpdateRoomUseCase';
export { DeleteRoomUseCase } from './use-cases/DeleteRoomUseCase';
export { ListRoomsUseCase } from './use-cases/ListRoomsUseCase';

export { useChatViewModel } from './view-models/useChatViewModel';
export { useChatRoomViewModel } from './view-models/useChatRoomViewModel';

// Types
export type { SendMessageParams, SendMessageResult } from './use-cases/SendMessageUseCase';
export type { ReceiveMessageParams, ReceiveMessageResult } from './use-cases/ReceiveMessageUseCase';
export type { DeleteMessageParams, DeleteMessageResult } from './use-cases/DeleteMessageUseCase';
export type { CopyMessageParams, CopyMessageResult } from './use-cases/CopyMessageUseCase';
export type { ChatState, ChatActions } from './view-models/useChatViewModel';

// Room Management Types
export type { CreateRoomParams, CreateRoomResult } from './use-cases/CreateRoomUseCase';
export type { UpdateRoomParams, UpdateRoomResult } from './use-cases/UpdateRoomUseCase';
export type { DeleteRoomParams, DeleteRoomResult } from './use-cases/DeleteRoomUseCase';
export type { ListRoomsParams, ListRoomsResult } from './use-cases/ListRoomsUseCase';
export type { ChatRoomState, ChatRoomActions } from './view-models/useChatRoomViewModel';
