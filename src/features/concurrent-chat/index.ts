// Main concurrent chat feature exports
export { ConcurrentChat } from './components/ConcurrentChat';
export { MessageList } from './components/MessageList';
export { MessageItem } from './components/MessageItem';
export { MessageInput } from './components/MessageInput';

// Core hooks
export { useConcurrentChat } from './core/hooks/useConcurrentChat';
export { useMessageCommands } from './core/hooks/useMessageCommands';
export { usePluginSystem } from './core/hooks/usePluginSystem';
export { useModelSelection } from './core/hooks/useModelSelection';

// Core services
export { ServiceContainer } from './core/container/ServiceContainer';
export { EventBus } from './core/events/EventBus';

// Core types
export * from './core/types';

// Plugin system
export * from './plugins';

// Feature plugins
export * from './features'; 