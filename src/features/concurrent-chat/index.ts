// Public surface for the concurrent-chat feature

// UI
export * from './ui';

// Hooks (no hooks barrel exists yet, so export explicitly)
export { useConcurrentChat } from './core/hooks/useConcurrentChat';
export { useMessageCommands } from './core/hooks/useMessageCommands';
export { useModelSelection } from './core/hooks/useModelSelection';
export { usePluginSystem } from './core/hooks/usePluginSystem';

// Types
export * from './core/types';
