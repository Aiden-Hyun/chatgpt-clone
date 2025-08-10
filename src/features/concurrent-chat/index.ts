// Main concurrent chat feature exports - Public API

// Components
export * from './components';

// Hooks
export { useConcurrentChat } from './core/hooks/useConcurrentChat';
export { useMessageCommands } from './core/hooks/useMessageCommands';
export { useModelSelection as useCoreModelSelection } from './core/hooks/useModelSelection';
export { usePluginSystem } from './core/hooks/usePluginSystem';

// Types
export * from './core/types';

// Commands
export { CancelMessageCommand, ChangeModelCommand, ClearMessagesCommand, RetryMessageCommand, SendMessageCommand } from './core/commands';

// Core services (for external usage)
export { ServiceContainer } from './core/container/ServiceContainer';
export { EventBus } from './core/events/EventBus';

// Feature plugins
export * from './features';
