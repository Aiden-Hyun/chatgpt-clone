# Concurrent Chat Implementation Plan (SOLID & Extensible)

## Overview
Build a simple, clean concurrent chat system that allows multiple messages to be sent simultaneously without blocking the UI or interfering with each other. The architecture follows SOLID principles and is extensible to support future features like animations, regeneration, message editing, and other advanced capabilities.

## Current API Setup Understanding

### 1. Supabase Configuration
- **URL**: `https://twzumsgzuwguketxbdet.supabase.co`
- **Edge Function**: `/openai-chat` at `https://twzumsgzuwguketxbdet.functions.supabase.co/openai-chat`
- **Authentication**: Supabase JWT tokens (`access_token` from session)
- **Database**: PostgreSQL with `chatrooms` and `messages` tables

### 2. OpenAI Integration
- **API Key**: Stored in Supabase Edge Function environment (`OPENAI_API_KEY`)
- **Endpoint**: Proxied through Supabase Edge Function to `https://api.openai.com/v1/chat/completions`
- **Models**: Currently supports `gpt-3.5-turbo` (default) and `gpt-4`
- **Response Format**: Full OpenAI response with model info and choices

### 3. Model Selection System
- **Current Models**: 
  - `gpt-3.5-turbo` (default)
  - `gpt-4`
- **Model Storage**: Stored in `chatrooms` table in Supabase
- **Model Selection**: Managed via `useModelSelection` hook
- **Model Persistence**: Models are saved per chat room

### 4. API Flow
```
Client → Supabase Edge Function → OpenAI API
  ↓           ↓                    ↓
JWT Token → Validate → API Key
Model → Pass Through → Model Selection
Messages → Format → Chat Completion
Response ← Parse ← Full OpenAI Response
```

## SOLID Principles Compliance

### S - Single Responsibility Principle (SRP)
- Each class/component has one reason to change
- Plugins handle specific features only
- Services focus on single domains
- Hooks manage specific state concerns

### O - Open/Closed Principle (OCP)
- Core system is closed for modification
- New features added via plugins (open for extension)
- Event system enables new behaviors without core changes
- Strategy pattern for interchangeable algorithms

### L - Liskov Substitution Principle (LSP)
- All plugins can be substituted for their base types
- Service implementations are interchangeable
- Event handlers follow consistent contracts
- Commands can be substituted for their interface

### I - Interface Segregation Principle (ISP)
- Small, focused interfaces instead of large ones
- Plugins implement only interfaces they need
- Commands have minimal, focused contracts
- Strategies have single-purpose interfaces

### D - Dependency Inversion Principle (DIP)
- Core system depends on abstractions, not concretions
- Dependency injection container manages services
- Commands depend on service interfaces
- Event system decouples components

## Core Requirements
1. **Concurrent Message Processing**: Send multiple messages without waiting for previous responses
2. **Independent Message States**: Each message has its own loading/processing state
3. **Real-time Updates**: Show typing indicators and content as it streams
4. **Error Handling**: Handle failures gracefully with retry options
5. **Clean UI**: Simple, intuitive interface
6. **Extensible Architecture**: Support for future features like animations, regeneration, editing, etc.
7. **SOLID Compliance**: Follow all SOLID principles for maintainability
8. **Model Selection**: Support for multiple AI models with easy switching
9. **Supabase Integration**: Leverage existing Supabase setup and authentication

## SOLID Architecture

### 1. Interface Segregation
- **Small, Focused Interfaces**: Each interface has a single purpose
- **Plugin-Specific Contracts**: Plugins implement only what they need
- **Command Interfaces**: Minimal contracts for actions
- **Strategy Interfaces**: Single-purpose algorithm contracts

### 2. Dependency Injection
- **Service Container**: Centralized dependency management
- **Interface-Based Dependencies**: All dependencies are abstractions
- **Constructor Injection**: Dependencies injected via constructors
- **Lazy Loading**: Services loaded on demand

### 3. Command Pattern
- **Action Encapsulation**: Each action is a command object
- **Undo/Redo Support**: Commands can be reversed
- **Queue Management**: Commands can be queued and executed
- **Transaction Support**: Commands can be batched

### 4. Strategy Pattern
- **Interchangeable Algorithms**: Different implementations for same interface
- **Runtime Selection**: Strategies can be changed at runtime
- **Plugin Integration**: Plugins provide strategy implementations
- **Configuration-Driven**: Strategies selected via configuration

### 5. Event-Driven Architecture
- **Loose Coupling**: Components communicate via events
- **Type-Safe Events**: All events are typed for safety
- **Async Processing**: Events can be processed asynchronously
- **Event History**: Events are logged for debugging

## Extensible File Structure (SOLID)

```
src/features/concurrent-chat/
├── core/
│   ├── types/
│   │   ├── index.ts                    # Core type definitions
│   │   ├── interfaces/
│   │   │   ├── IMessageProcessor.ts    # Message processing interface
│   │   │   ├── IMessageRenderer.ts     # Message rendering interface
│   │   │   ├── IMessageValidator.ts    # Message validation interface
│   │   │   ├── IAnimationStrategy.ts   # Animation strategy interface
│   │   │   ├── ICommand.ts             # Command interface
│   │   │   ├── IPlugin.ts              # Plugin interface
│   │   │   ├── IAIService.ts           # AI service interface
│   │   │   └── IModelSelector.ts       # Model selection interface
│   │   └── events/
│   │       └── MessageEvents.ts        # Event type definitions
│   ├── utils/
│   │   └── messageIdGenerator.ts       # ID generation utilities
│   ├── services/
│   │   ├── ConcurrentAIService.ts      # AI API communication (Supabase)
│   │   ├── MessageService.ts           # Message processing service
│   │   ├── ValidationService.ts        # Message validation service
│   │   └── ModelSelectionService.ts    # Model selection service
│   ├── commands/
│   │   ├── SendMessageCommand.ts       # Send message command
│   │   ├── CancelMessageCommand.ts     # Cancel message command
│   │   ├── RetryMessageCommand.ts      # Retry message command
│   │   ├── ClearMessagesCommand.ts     # Clear messages command
│   │   └── ChangeModelCommand.ts       # Change model command
│   ├── strategies/
│   │   ├── AnimationStrategy.ts        # Animation strategy base
│   │   ├── TypewriterAnimation.ts      # Typewriter animation
│   │   └── FadeInAnimation.ts          # Fade-in animation
│   ├── hooks/
│   │   ├── useConcurrentChat.ts        # Main state management hook
│   │   ├── useMessageCommands.ts       # Command management hook
│   │   ├── usePluginSystem.ts          # Plugin management hook
│   │   └── useModelSelection.ts        # Model selection hook
│   ├── events/
│   │   └── EventBus.ts                 # Event system for features
│   └── container/
│       └── ServiceContainer.ts         # Dependency injection container
├── features/
│   ├── animation/
│   │   ├── types.ts
│   │   ├── AnimationService.ts
│   │   ├── useMessageAnimation.ts
│   │   ├── strategies/
│   │   │   ├── TypewriterStrategy.ts
│   │   │   └── FadeInStrategy.ts
│   │   └── components/
│   │       └── AnimatedMessage.tsx
│   ├── regeneration/
│   │   ├── types.ts
│   │   ├── RegenerationService.ts
│   │   ├── useMessageRegeneration.ts
│   │   ├── commands/
│   │   │   └── RegenerateMessageCommand.ts
│   │   └── components/
│   │       └── RegenerateButton.tsx
│   ├── editing/
│   │   ├── types.ts
│   │   ├── EditingService.ts
│   │   ├── useMessageEditing.ts
│   │   ├── commands/
│   │   │   └── EditMessageCommand.ts
│   │   └── components/
│   │       └── EditableMessage.tsx
│   ├── streaming/
│   │   ├── types.ts
│   │   ├── StreamingService.ts
│   │   ├── useMessageStreaming.ts
│   │   ├── strategies/
│   │   │   ├── RealTimeStreaming.ts
│   │   │   └── BufferedStreaming.ts
│   │   └── components/
│   │       └── StreamingIndicator.tsx
│   └── model-selection/
│       ├── types.ts
│       ├── ModelSelectionService.ts
│       ├── useModelSelection.ts
│       ├── commands/
│       │   └── ChangeModelCommand.ts
│       └── components/
│           └── ModelSelector.tsx
├── plugins/
│   ├── PluginManager.ts                # Plugin registration and management
│   ├── BasePlugin.ts                   # Base class for all plugins
│   ├── interfaces/
│   │   ├── ILifecyclePlugin.ts         # Plugin lifecycle interface
│   │   ├── IEventPlugin.ts             # Plugin event interface
│   │   └── IRenderPlugin.ts            # Plugin render interface
│   └── index.ts                        # Plugin exports
├── components/
│   ├── ConcurrentChat.tsx              # Main container component
│   ├── MessageList.tsx                 # Message display list
│   ├── MessageItem.tsx                 # Individual message component
│   ├── MessageInput.tsx                # Input component
│   └── index.ts                        # Component exports
└── index.ts                            # Feature exports
```

## Core Implementation Steps (SOLID)

### Phase 1: Core Foundation (SOLID)

#### 1. **Interface Definitions** (`core/types/interfaces/`)
```typescript
// IMessageProcessor.ts
interface IMessageProcessor {
  process(message: ConcurrentMessage): Promise<void>;
}

// IMessageRenderer.ts
interface IMessageRenderer {
  render(message: ConcurrentMessage): ReactNode;
}

// IMessageValidator.ts
interface IMessageValidator {
  validate(message: ConcurrentMessage): boolean;
}

// IAnimationStrategy.ts
interface IAnimationStrategy {
  animate(content: string, element: HTMLElement): Promise<void>;
}

// ICommand.ts
interface ICommand {
  execute(): Promise<void>;
  canUndo(): boolean;
  undo(): Promise<void>;
}

// IPlugin.ts
interface IPlugin {
  id: string;
  name: string;
  version: string;
  init(): Promise<void>;
  destroy(): Promise<void>;
}

// IAIService.ts
interface IAIService {
  sendMessage(request: AIApiRequest, session: Session): Promise<AIApiResponse>;
  sendMessageWithStreaming(
    request: AIApiRequest, 
    session: Session, 
    onChunk: (chunk: string) => void
  ): Promise<AIApiResponse>;
}

// IModelSelector.ts
interface IModelSelector {
  getAvailableModels(): ModelOption[];
  getCurrentModel(): string;
  setModel(model: string): Promise<void>;
  getModelForRoom(roomId: number): Promise<string>;
}
```

#### 2. **Dependency Injection Container** (`core/container/ServiceContainer.ts`)
```typescript
class ServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  
  register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }
  
  registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }
  
  get<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key);
    }
    
    if (this.factories.has(key)) {
      const service = this.factories.get(key)!();
      this.services.set(key, service);
      return service;
    }
    
    throw new Error(`Service ${key} not found`);
  }
}
```

#### 3. **Command Pattern Implementation** (`core/commands/`)
```typescript
// SendMessageCommand.ts
class SendMessageCommand implements ICommand {
  constructor(
    private messageService: IMessageService,
    private content: string,
    private messageId: string,
    private model: string
  ) {}
  
  async execute(): Promise<void> {
    await this.messageService.send(this.content, this.messageId, this.model);
  }
  
  canUndo(): boolean {
    return false; // Can't undo sending
  }
  
  async undo(): Promise<void> {
    throw new Error('Cannot undo send message');
  }
}

// ChangeModelCommand.ts
class ChangeModelCommand implements ICommand {
  constructor(
    private modelSelector: IModelSelector,
    private newModel: string,
    private roomId?: number
  ) {}
  
  async execute(): Promise<void> {
    await this.modelSelector.setModel(this.newModel);
  }
  
  canUndo(): boolean {
    return true; // Can undo model change
  }
  
  async undo(): Promise<void> {
    // Revert to previous model
  }
}
```

#### 4. **Strategy Pattern Implementation** (`core/strategies/`)
```typescript
// AnimationStrategy.ts
abstract class AnimationStrategy implements IAnimationStrategy {
  abstract animate(content: string, element: HTMLElement): Promise<void>;
  
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// TypewriterAnimation.ts
class TypewriterAnimation extends AnimationStrategy {
  async animate(content: string, element: HTMLElement): Promise<void> {
    element.textContent = '';
    for (const char of content) {
      element.textContent += char;
      await this.delay(50);
    }
  }
}

// FadeInAnimation.ts
class FadeInAnimation extends AnimationStrategy {
  async animate(content: string, element: HTMLElement): Promise<void> {
    element.textContent = content;
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.5s ease-in';
    
    await this.delay(100);
    element.style.opacity = '1';
  }
}
```

### Phase 2: Core Services (SOLID)

#### 1. **Concurrent AI Service** (`core/services/ConcurrentAIService.ts`)
```typescript
class ConcurrentAIService implements IAIService {
  private readonly EDGE_FUNCTION_BASE_URL = 'https://twzumsgzuwguketxbdet.functions.supabase.co';

  async sendMessage(request: AIApiRequest, session: Session): Promise<AIApiResponse> {
    const accessToken = session.access_token;
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const url = `${this.EDGE_FUNCTION_BASE_URL}/openai-chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId: request.roomId,
        messages: request.messages,
        model: request.model,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async sendMessageWithStreaming(
    request: AIApiRequest,
    session: Session,
    onChunk: (chunk: string) => void
  ): Promise<AIApiResponse> {
    // Implementation for streaming (if supported by edge function)
    // For now, fall back to regular sendMessage
    return this.sendMessage(request, session);
  }
}
```

#### 2. **Model Selection Service** (`core/services/ModelSelectionService.ts`)
```typescript
class ModelSelectionService implements IModelSelector {
  private readonly supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY);
  
  getAvailableModels(): ModelOption[] {
    return [
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      { label: 'GPT-4', value: 'gpt-4' },
      // Easy to add more models
    ];
  }
  
  getCurrentModel(): string {
    return 'gpt-3.5-turbo'; // Default
  }
  
  async setModel(model: string): Promise<void> {
    // Update current model
  }
  
  async getModelForRoom(roomId: number): Promise<string> {
    const { data } = await this.supabase
      .from('chatrooms')
      .select('model')
      .eq('id', roomId)
      .single();
    
    return data?.model || 'gpt-3.5-turbo';
  }
}
```

#### 3. **Message Service** (`core/services/MessageService.ts`)
```typescript
class MessageService implements IMessageService {
  constructor(
    private aiService: IAIService,
    private eventBus: IEventBus,
    private container: ServiceContainer
  ) {}
  
  async send(content: string, messageId: string, model: string): Promise<void> {
    const command = new SendMessageCommand(this, content, messageId, model);
    await command.execute();
  }
  
  async cancel(messageId: string): Promise<void> {
    const command = new CancelMessageCommand(this, messageId);
    await command.execute();
  }
  
  async retry(messageId: string): Promise<void> {
    const command = new RetryMessageCommand(this, messageId);
    await command.execute();
  }
}
```

### Phase 3: Plugin System (SOLID)

#### 1. **Plugin Interfaces** (`plugins/interfaces/`)
```typescript
// ILifecyclePlugin.ts
interface ILifecyclePlugin {
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
}

// IEventPlugin.ts
interface IEventPlugin {
  handleEvent(event: MessageEvent): Promise<void>;
  getEventTypes(): string[];
}

// IRenderPlugin.ts
interface IRenderPlugin {
  render(message: ConcurrentMessage): ReactNode;
  canRender(message: ConcurrentMessage): boolean;
}
```

#### 2. **Base Plugin** (`plugins/BasePlugin.ts`)
```typescript
abstract class BasePlugin implements IPlugin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly version: string,
    protected eventBus: IEventBus,
    protected container: ServiceContainer
  ) {}
  
  abstract init(): Promise<void>;
  abstract destroy(): Promise<void>;
  
  protected publishEvent(event: MessageEvent): void {
    this.eventBus.publish(event);
  }
  
  protected subscribeToEvent(eventType: string, handler: EventHandler): void {
    this.eventBus.subscribe(eventType, handler);
  }
}
```

### Phase 4: Feature Plugins (SOLID)

#### 1. **Animation Plugin** (`features/animation/`)
```typescript
class AnimationPlugin extends BasePlugin implements IRenderPlugin {
  private animationStrategy: IAnimationStrategy;
  
  constructor(eventBus: IEventBus, container: ServiceContainer) {
    super('animation', 'Animation Plugin', '1.0.0', eventBus, container);
    this.animationStrategy = container.get<IAnimationStrategy>('animationStrategy');
  }
  
  async init(): Promise<void> {
    this.subscribeToEvent('MESSAGE_COMPLETED', this.handleMessageCompleted.bind(this));
  }
  
  async destroy(): Promise<void> {
    // Cleanup
  }
  
  render(message: ConcurrentMessage): ReactNode {
    return <AnimatedMessage message={message} strategy={this.animationStrategy} />;
  }
  
  canRender(message: ConcurrentMessage): boolean {
    return message.role === 'assistant' && message.status === 'completed';
  }
  
  private async handleMessageCompleted(event: MessageEvent): Promise<void> {
    // Handle animation
  }
}
```

#### 2. **Model Selection Plugin** (`features/model-selection/`)
```typescript
class ModelSelectionPlugin extends BasePlugin implements IEventPlugin {
  async init(): Promise<void> {
    this.subscribeToEvent('MODEL_CHANGED', this.handleModelChanged.bind(this));
  }
  
  async destroy(): Promise<void> {
    // Cleanup
  }
  
  async handleEvent(event: MessageEvent): Promise<void> {
    if (event.type === 'MODEL_CHANGED') {
      await this.handleModelChanged(event);
    }
  }
  
  getEventTypes(): string[] {
    return ['MODEL_CHANGED'];
  }
  
  private async handleModelChanged(event: MessageEvent): Promise<void> {
    const command = new ChangeModelCommand(
      this.container.get<IModelSelector>('modelSelector'),
      event.model,
      event.roomId
    );
    await command.execute();
  }
}
```

### Phase 5: Hooks (SOLID)

#### 1. **useMessageCommands** (`core/hooks/useMessageCommands.ts`)
```typescript
function useMessageCommands() {
  const container = useServiceContainer();
  const [commandHistory, setCommandHistory] = useState<ICommand[]>([]);
  
  const executeCommand = useCallback(async (command: ICommand) => {
    await command.execute();
    setCommandHistory(prev => [...prev, command]);
  }, []);
  
  const undoLastCommand = useCallback(async () => {
    const lastCommand = commandHistory[commandHistory.length - 1];
    if (lastCommand && lastCommand.canUndo()) {
      await lastCommand.undo();
      setCommandHistory(prev => prev.slice(0, -1));
    }
  }, [commandHistory]);
  
  return { executeCommand, undoLastCommand, commandHistory };
}
```

#### 2. **useModelSelection** (`core/hooks/useModelSelection.ts`)
```typescript
function useModelSelection(roomId?: number) {
  const container = useServiceContainer();
  const modelSelector = container.get<IModelSelector>('modelSelector');
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  
  useEffect(() => {
    if (roomId) {
      modelSelector.getModelForRoom(roomId).then(setCurrentModel);
    }
  }, [roomId, modelSelector]);
  
  const changeModel = useCallback(async (model: string) => {
    const command = new ChangeModelCommand(modelSelector, model, roomId);
    await command.execute();
    setCurrentModel(model);
  }, [modelSelector, roomId]);
  
  return {
    currentModel,
    availableModels: modelSelector.getAvailableModels(),
    changeModel,
  };
}
```

## SOLID Benefits

### 1. **Maintainability**
- Clear separation of concerns
- Easy to understand and modify
- Reduced coupling between components

### 2. **Testability**
- Dependencies can be easily mocked
- Commands can be tested in isolation
- Strategies can be tested independently

### 3. **Extensibility**
- New features added via plugins
- New strategies can be added easily
- New commands can be created without core changes
- New models can be added easily

### 4. **Reusability**
- Commands can be reused across different contexts
- Strategies can be shared between plugins
- Services can be used by multiple components

## Success Criteria

1. ✅ Core concurrent messaging works
2. ✅ Plugin system follows SOLID principles
3. ✅ Commands support undo/redo operations
4. ✅ Strategies are interchangeable
5. ✅ Dependency injection works correctly
6. ✅ Interface segregation is maintained
7. ✅ Liskov substitution is guaranteed
8. ✅ Open/closed principle is followed
9. ✅ Single responsibility is maintained
10. ✅ Code is highly testable and maintainable
11. ✅ Model selection works correctly
12. ✅ Supabase integration is maintained
13. ✅ API calls work with existing edge function

## Notes

- Follow SOLID principles strictly
- Use dependency injection consistently
- Implement command pattern for all actions
- Use strategy pattern for interchangeable algorithms
- Maintain interface segregation
- Ensure Liskov substitution compliance
- Keep components focused and single-purpose
- Test all abstractions and implementations
- Leverage existing Supabase setup
- Support multiple AI models
- Maintain backward compatibility with existing API 