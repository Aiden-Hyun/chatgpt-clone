// src/entities/message/index.ts

// Export all message types and constants
export * from "./model/constants";
export * from "./model/selectors";
export * from "./model/types";

// Export service types (but not ChatMessage to avoid duplicates)
export type { AIApiRequest, AIApiResponse } from "./model/index";

// Export all message hooks
export * from "./hooks/useMessageActions";
export * from "./hooks/useMessageInput";
export * from "./hooks/useMessageLoader";
export * from "./hooks/useRegenerationService";
