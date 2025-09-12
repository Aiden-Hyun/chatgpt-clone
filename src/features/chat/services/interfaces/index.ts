// src/features/chat/services/interfaces/index.ts
export * from "@/entities/message";
// IChatRoomService moved to @/entities/chatRoom
export * from "./IMessageService";
export * from "./IUIStateService";

// New segregated interfaces
export * from "./IAnimationService";
export * from "./IMessageStateService";
export * from "./IRegenerationService";

// Search service interface
