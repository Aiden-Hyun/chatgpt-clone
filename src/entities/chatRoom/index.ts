// src/entities/chatRoom/index.ts

// Export all chat room types and constants
export * from "./model/constants";
export * from "./model/selectors";
export * from "./model/types";

// Export the main hook
export { useChatRooms } from "./hooks/useChatRooms";

// Export the service implementation
export { SupabaseChatRoomService } from "./services/SupabaseChatRoomService";
