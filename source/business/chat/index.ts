// Chat Feature - Business Layer
export { MessageEntity, Message, MessageRole, MessageMetadata } from './entities/Message';
export { ChatRoomEntity, ChatRoom } from './entities/ChatRoom';

export { SendMessageUseCase } from './use-cases/SendMessageUseCase';
export { ReceiveMessageUseCase } from './use-cases/ReceiveMessageUseCase';
export { DeleteMessageUseCase } from './use-cases/DeleteMessageUseCase';
export { CopyMessageUseCase } from './use-cases/CopyMessageUseCase';

export { useChatViewModel } from './view-models/useChatViewModel';

// Types
export type { SendMessageParams, SendMessageResult } from './use-cases/SendMessageUseCase';
export type { ReceiveMessageParams, ReceiveMessageResult } from './use-cases/ReceiveMessageUseCase';
export type { DeleteMessageParams, DeleteMessageResult } from './use-cases/DeleteMessageUseCase';
export type { CopyMessageParams, CopyMessageResult } from './use-cases/CopyMessageUseCase';
export type { ChatState, ChatActions } from './view-models/useChatViewModel';
