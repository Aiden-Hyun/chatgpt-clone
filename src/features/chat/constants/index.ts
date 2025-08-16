// src/features/chat/constants/index.ts

// Feature-level barrel: re-export topic-specific constants
export * from './debug';
export * from './logic';
export * from './models';
export * from './timing';
export * from './typing';

// Feature-scoped general constants
export const MAX_MESSAGES = 100;
