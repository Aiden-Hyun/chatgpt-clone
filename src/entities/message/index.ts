// src/entities/message/index.ts

// Export all message types and constants
export * from "./model/constants";
export * from "./model/selectors";
export * from "./model/types";

// Export service types (but not ChatMessage to avoid duplicates)
export type { AIApiRequest, AIApiResponse } from "./model/index";

// Export message hooks for internal use (these will be re-exported by features)
export { useMessageActions } from "./hooks/useMessageActions";
export { useMessageInput } from "./hooks/useMessageInput";
export { useMessageLoader } from "./hooks/useMessageLoader";
export { useRegenerationService } from "./hooks/useRegenerationService";

// Export the CRUD implementation
export { SupabaseMessageService } from "./CRUD/SupabaseMessageCRUD";
