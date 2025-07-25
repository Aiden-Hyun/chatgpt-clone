// src/features/chat/services/index.ts

// Legacy exports (for backward compatibility) - moved to legacy folder
export * from './legacy';

// Main sendMessageHandler (now uses SOLID architecture)
export { sendMessageHandler } from './sendMessage/index';

// SOLID architecture exports
export * from './core';
export * from './implementations';
export * from './interfaces';
export * from './types';

// Configuration
export { configureServices } from './config/ServiceConfiguration';

