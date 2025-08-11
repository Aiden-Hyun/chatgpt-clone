# Diagrams

## Message Lifecycle
```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Typing: compose
  Typing --> Sending: send(userText, requestId)
  Sending --> Awaiting: enqueue(assistantPlaceholder)
  Awaiting --> Rendering: response(content, requestId)
  Rendering --> Persisting: persist(roomId, requestId)
  Persisting --> Idle: done
  Awaiting --> Cancelled: abort(requestId)
  Rendering --> Cancelled: ignoreLate(requestId)
```

## High-level Architecture
```mermaid
flowchart LR
  UI[UI components]\nMessageList/ChatInput --> Hooks
  Hooks --> Orchestrators[useMessagesCombined]
  Orchestrators --> ServicesCore[MessageSenderService, RetryService, AIResponseProcessor]
  ServicesCore --> Implementations[OpenAIAPIService, ReactUIStateService, Supabase*]
  Implementations --> Persistence[Supabase]
  Implementations --> Navigation[Expo Router]
```

## Import Graph (services)
```mermaid
flowchart TD
  ServiceFactory --> MessageSenderService
  ServiceFactory --> AIResponseProcessor
  MessageSenderService --> ReactUIStateService
  MessageSenderService --> OpenAIAPIService
  MessageSenderService --> SupabaseMessageService
  MessageSenderService --> SupabaseChatRoomService
  ReactUIStateService --> handleMessageState
```
