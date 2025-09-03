// src/features/chat/services/index.ts

// Legacy exports removed - functionality consolidated into implementation classes

// Main sendMessageHandler (now uses SOLID architecture)
export { sendMessageHandler } from "./sendMessage/index";

// SOLID architecture exports
export * from "./core";
export * from "./implementations";
export * from "./interfaces";

// Export chat room service from entity
export { SupabaseChatRoomService } from "@/entities/chatRoom";

// Configuration
export { configureServices } from "./config/ServiceConfiguration";
