// src/features/chat/constants/index.ts

// Feature-level barrel: re-export topic-specific constants
export * from './models';
export * from './typing';
export * from './debug';

// Feature-scoped general constants
export const MAX_MESSAGES = 100;
