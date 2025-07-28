# Components Catalog

A comprehensive guide to all available components in the ChatGPT Clone app, with accurate file paths, props, and usage examples.

## 📁 File Structure

```
src/
├── shared/components/
│   ├── ui/                    # Core UI components
│   │   ├── LoadingScreen.tsx
│   │   ├── LoadingWrapper.tsx
│   │   ├── IconSymbol.tsx
│   │   ├── HoverDetector/
│   │   └── TabBarBackground.tsx
│   ├── ThemedText.tsx         # Themed text component
│   ├── ThemedView.tsx         # Themed view component
│   ├── Collapsible.tsx        # Expandable content
│   └── HapticTab.tsx          # Tab with haptic feedback
└── features/chat/components/
    ├── ChatInput/             # Message input
    ├── ChatMessageBubble/     # Individual message
    ├── ChatHeader/            # Chat screen header
    ├── RoomListItem/          # Chat room item
    └── ChatMessageList.tsx    # Message list container
```

## 🧩 Shared Components

### **ThemedText**
**File**: `src/shared/components/ThemedText.tsx`  
**When**: Any text that needs theme support and consistent styling

**Props**:
```typescript
interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  lightColor?: string;  // Light mode color override
  darkColor?: string;   // Dark mode color override
}
```

**Usage**:
```tsx
import { ThemedText } from '@/shared/components';

// Basic usage
<ThemedText>Default text</ThemedText>

// With type variants
<ThemedText type="title">Page Title</ThemedText>
<ThemedText type="subtitle">Section Subtitle</ThemedText>
<ThemedText type="defaultSemiBold">Bold text</ThemedText>
<ThemedText type="link">Clickable link</ThemedText>

// With color overrides
<ThemedText lightColor="#000000" darkColor="#FFFFFF">
  Custom colored text
</ThemedText>
```

### **ThemedView**
**File**: `src/shared/components/ThemedView.tsx`  
**When**: Any view that needs themed background

**Props**:
```typescript
interface ThemedViewProps extends ViewProps {
  lightColor?: string;  // Light mode background override
  darkColor?: string;   // Dark mode background override
}
```

**Usage**:
```tsx
import { ThemedView } from '@/shared/components';

// Basic usage
<ThemedView>
  <ThemedText>Content with themed background</ThemedText>
</ThemedView>

// With custom background colors
<ThemedView lightColor="#F5F5F5" darkColor="#2C2E33">
  <ThemedText>Custom background</ThemedText>
</ThemedView>
```

### **LoadingScreen**
**File**: `src/shared/components/ui/LoadingScreen.tsx`  
**When**: Full-screen or inline loading indicator

**Props**:
```typescript
interface LoadingScreenProps {
  message?: string;           // Optional loading message
  size?: 'small' | 'large';   // Spinner size (default: 'large')
  fullScreen?: boolean;       // Full-screen vs inline (default: true)
}
```

**Usage**:
```tsx
import { LoadingScreen } from '@/shared/components';

// Full-screen loading
<LoadingScreen message="Loading your chat..." />

// Inline loading
<LoadingScreen 
  message="Processing..." 
  size="small" 
  fullScreen={false} 
/>
```

### **LoadingWrapper**
**File**: `src/shared/components/ui/LoadingWrapper.tsx`  
**When**: Conditional loading (show loading OR content)

**Props**:
```typescript
interface LoadingWrapperProps {
  loading: boolean;           // Whether to show loading state
  children: React.ReactNode;  // Content to show when not loading
  message?: string;           // Loading message
  size?: 'small' | 'large';   // Spinner size
  fullScreen?: boolean;       // Full-screen vs inline
}
```

**Usage**:
```tsx
import { LoadingWrapper } from '@/shared/components';

// Basic conditional loading
<LoadingWrapper loading={isLoading}>
  <ChatMessageList messages={messages} />
</LoadingWrapper>

// With custom loading message
<LoadingWrapper 
  loading={isLoading} 
  message="Fetching messages..."
  size="large"
>
  <ChatMessageList messages={messages} />
</LoadingWrapper>
```

### **Collapsible**
**File**: `src/shared/components/Collapsible.tsx`  
**When**: Expandable/collapsible content sections

**Props**:
```typescript
interface CollapsibleProps {
  title: string;              // Header text
  children: React.ReactNode;  // Collapsible content
}
```

**Usage**:
```tsx
import { Collapsible } from '@/shared/components';

<Collapsible title="Advanced Settings">
  <ThemedText>Hidden content that can be expanded</ThemedText>
  <ThemedText>More settings here...</ThemedText>
</Collapsible>
```

### **IconSymbol**
**File**: `src/shared/components/ui/IconSymbol.tsx`  
**When**: Platform-specific icons (SF Symbols on iOS, Material Icons on Android/web)

**Props**:
```typescript
interface IconSymbolProps {
  name: IconSymbolName;       // Icon name (mapped from SF Symbols)
  size?: number;              // Icon size (default: 24)
  color: string | OpaqueColorValue;  // Icon color
  style?: StyleProp<TextStyle>;      // Additional styles
  weight?: SymbolWeight;      // Icon weight (iOS only)
}
```

**Available Icons**:
```typescript
type IconSymbolName = 
  | 'house.fill'                           // Home icon
  | 'paperplane.fill'                      // Send icon
  | 'chevron.left.forwardslash.chevron.right'  // Code icon
  | 'chevron.right';                       // Right arrow
```

**Usage**:
```tsx
import { IconSymbol } from '@/shared/components';
import { useAppTheme } from '@/shared/hooks';

const theme = useAppTheme();

<IconSymbol 
  name="house.fill" 
  size={24} 
  color={theme.colors.text.primary} 
/>
```

### **HoverDetector**
**File**: `src/shared/components/ui/HoverDetector/index.tsx`  
**When**: Hover state detection (web platform) or press state (mobile)

**Props**:
```typescript
interface HoverDetectorProps extends PressableProps {
  children: ReactNode;                    // Content to wrap
  onHoverChange?: (isHovered: boolean) => void;  // Hover state callback
}
```

**Usage**:
```tsx
import { HoverDetector } from '@/shared/components';

<HoverDetector onHoverChange={(isHovered) => console.log('Hovered:', isHovered)}>
  <ThemedText>Hover over me</ThemedText>
</HoverDetector>
```

### **HapticTab**
**File**: `src/shared/components/HapticTab.tsx`  
**When**: Tab with haptic feedback (iOS)

**Props**: `BottomTabBarButtonProps` - All standard tab bar button props

**Usage**:
```tsx
import { HapticTab } from '@/shared/components';

// Used in tab navigation configuration
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarButton: (props) => <HapticTab {...props} />
  }}
/>
```

## 💬 Chat Components

### **ChatInput**
**File**: `src/features/chat/components/ChatInput/index.tsx`  
**When**: Message input with send functionality

**Props**:
```typescript
interface ChatInputProps {
  input: string;                                    // Input value
  onChangeText: (text: string) => void;            // Text change handler
  onSend: () => void;                              // Send message handler
  sending: boolean;                                // Whether message is being sent
  isTyping: boolean;                               // Whether AI is typing
  inputRef: RefObject<TextInput | null>;           // Input reference
}
```

**Usage**:
```tsx
import { ChatInput } from '@/features/chat/components';

const [input, setInput] = useState('');
const inputRef = useRef<TextInput>(null);

<ChatInput
  input={input}
  onChangeText={setInput}
  onSend={handleSend}
  sending={sending}
  isTyping={isTyping}
  inputRef={inputRef}
/>
```

### **ChatMessageBubble**
**File**: `src/features/chat/components/ChatMessageBubble/index.tsx`  
**When**: Individual message display with typing animation

**Props**:
```typescript
interface ChatMessageProps {
  item: {
    role: string;        // 'user' | 'assistant'
    content: string;     // Message content
  };
  isTyping?: boolean;                    // Whether this message is being typed
  onRegenerate?: () => void;             // Regeneration handler (assistant only)
  showAvatar?: boolean;                  // Whether to show AI avatar (default: true)
  isLastInGroup?: boolean;               // Whether last in message group (default: true)
}
```

**Usage**:
```tsx
import { ChatMessageBubble } from '@/features/chat/components';

// User message
<ChatMessageBubble
  item={{ role: 'user', content: 'Hello, how are you?' }}
/>

// Assistant message with regeneration
<ChatMessageBubble
  item={{ role: 'assistant', content: 'I\'m doing well, thank you!' }}
  onRegenerate={() => handleRegenerate(messageIndex)}
  isTyping={false}
  showAvatar={true}
  isLastInGroup={true}
/>

// Typing message
<ChatMessageBubble
  item={{ role: 'assistant', content: 'I\'m thinking...' }}
  isTyping={true}
/>
```

### **ChatHeader**
**File**: `src/features/chat/components/ChatHeader/index.tsx`  
**When**: Chat screen header with model selector

**Props**:
```typescript
interface ChatHeaderProps {
  selectedModel: string;                 // Current AI model
  updateModel: (model: string) => void;  // Model change handler
  onLogout: () => void;                  // Logout handler
}
```

**Available Models**:
- `gpt-3.5-turbo`
- `gpt-3.5-turbo-16k`
- `gpt-4`
- `gpt-4-turbo`
- `gpt-4o`

**Usage**:
```tsx
import { ChatHeader } from '@/features/chat/components';

<ChatHeader
  selectedModel={selectedModel}
  updateModel={setSelectedModel}
  onLogout={handleLogout}
/>
```

### **RoomListItem**
**File**: `src/features/chat/components/RoomListItem/index.tsx`  
**When**: Chat room list item with delete functionality

**Props**:
```typescript
interface Props {
  room: {
    id: number;    // Room ID
    name: string;  // Room name
  };
  onDelete: () => void;  // Delete room handler
  onPress: () => void;   // Room selection handler
}
```

**Usage**:
```tsx
import { RoomListItem } from '@/features/chat/components';

<RoomListItem
  room={{ id: 1, name: 'General Chat' }}
  onDelete={() => handleDeleteRoom(1)}
  onPress={() => handleSelectRoom(1)}
/>
```

### **ChatMessageList**
**File**: `src/features/chat/components/ChatMessageList.tsx`  
**When**: Scrollable list of chat messages with auto-scroll

**Props**:
```typescript
interface ChatMessageListProps {
  messages: ChatMessage[];                    // Array of messages
  isTyping: boolean;                          // Whether AI is typing
  regenerateMessage: (index: number) => void; // Regeneration handler
}
```

**Usage**:
```tsx
import { ChatMessageList } from '@/features/chat/components';

<ChatMessageList
  messages={messages}
  isTyping={isTyping}
  regenerateMessage={handleRegenerateMessage}
/>
```

## 🎯 Component Composition Patterns

### **Loading Pattern**
```tsx
// ✅ Good - Use LoadingWrapper for conditional loading
<LoadingWrapper loading={isLoading}>
  <ChatMessageList messages={messages} />
</LoadingWrapper>

// ❌ Bad - Manual loading state
{isLoading ? (
  <LoadingScreen />
) : (
  <ChatMessageList messages={messages} />
)}
```

### **Theme Pattern**
```tsx
// ✅ Good - Use themed components
<ThemedView>
  <ThemedText type="title">Title</ThemedText>
  <ThemedText type="default">Content</ThemedText>
</ThemedView>

// ❌ Bad - Inline styles
<View style={{ backgroundColor: '#FFFFFF' }}>
  <Text style={{ fontSize: 16, color: '#000000' }}>Content</Text>
</View>
```

### **Chat Composition Pattern**
```tsx
// Complete chat screen composition
<ThemedView style={styles.container}>
  <ChatHeader
    selectedModel={selectedModel}
    updateModel={setSelectedModel}
    onLogout={handleLogout}
  />
  
  <LoadingWrapper loading={isLoading}>
    <ChatMessageList
      messages={messages}
      isTyping={isTyping}
      regenerateMessage={handleRegenerate}
    />
  </LoadingWrapper>
  
  <ChatInput
    input={input}
    onChangeText={setInput}
    onSend={handleSend}
    sending={sending}
    isTyping={isTyping}
    inputRef={inputRef}
  />
</ThemedView>
```

## 📋 Import Patterns

### **Shared Components**
```tsx
import { 
  ThemedText, 
  ThemedView, 
  LoadingScreen, 
  LoadingWrapper,
  Collapsible,
  IconSymbol,
  HoverDetector,
  HapticTab 
} from '@/shared/components';
```

### **Chat Components**
```tsx
import {
  ChatInput,
  ChatMessageBubble,
  ChatHeader,
  RoomListItem,
  ChatMessageList
} from '@/features/chat/components';
```

## 🚫 Anti-Patterns

1. **Don't use inline styles** - Use themed components instead
2. **Don't create manual loading states** - Use LoadingWrapper
3. **Don't hardcode colors** - Use theme colors through themed components
4. **Don't duplicate component logic** - Use existing components
5. **Don't use wrong prop names** - Check the actual component interfaces

## 🔧 Development Rules

1. **Theme System**: Always use `useAppTheme` hook in style files
2. **Style Files**: Each component has a `.styles.ts` file
3. **Naming**: `ComponentName.tsx`, `ComponentName.styles.ts`
4. **Exports**: Export from appropriate index files
5. **Props**: Use TypeScript interfaces for all props
6. **Composition**: Prefer composition over inheritance 