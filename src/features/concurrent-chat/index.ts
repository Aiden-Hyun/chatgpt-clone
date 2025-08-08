// Main concurrent chat feature exports
export { ConcurrentChat } from './components/ConcurrentChat';
export { MessageInput } from './components/MessageInput';
export { MessageItem } from './components/MessageItem';
export { MessageList } from './components/MessageList';

// Core hooks
export { useConcurrentChat } from './core/hooks/useConcurrentChat';
export { useMessageCommands } from './core/hooks/useMessageCommands';
export { useModelSelection as useCoreModelSelection } from './core/hooks/useModelSelection';
export { usePluginSystem } from './core/hooks/usePluginSystem';

// Core services
export { ServiceContainer } from './core/container/ServiceContainer';
export { EventBus } from './core/events/EventBus';

// Core types
export * from './core/types';

// Feature plugins
export * from './features';
