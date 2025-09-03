// Debug configuration for chat feature
// Set to false to disable all chat debug logging in development
export const DEBUG_CHAT = false;

// Helper function for conditional debug logging
export const chatDebugLog = (message: string, data?: unknown) => {
  if (__DEV__ && DEBUG_CHAT) {
    console.log(message, data);
  }
};

export const chatDebugWarn = (message: string, data?: unknown) => {
  if (__DEV__ && DEBUG_CHAT) {
    console.warn(message, data);
  }
};

export const chatDebugError = (message: string, data?: unknown) => {
  if (__DEV__ && DEBUG_CHAT) {
    console.error(message, data);
  }
};
