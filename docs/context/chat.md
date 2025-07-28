# ChatContext Documentation

The `ChatContext` provides chat-related state management throughout the ChatGPT Clone application.

## 📁 File Location

**Context**: `src/features/chat/context/ChatContext.tsx`  
**Hook**: `src/features/chat/context/index.ts`

## 🎯 Purpose

The `ChatContext` manages:
- Current chat room state
- Global chat settings
- Chat-related UI state
- Cross-component chat data sharing

## 🔧 Implementation

### **Context Interface**
```typescript
interface ChatContextType {
  currentRoom: ChatRoom | null;
  setCurrentRoom: (room: ChatRoom | null) => void;
  chatSettings: ChatSettings;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}
```

### **useChatContext Hook**
```typescript
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
```

## 📖 Usage Examples

### **Basic Usage**
```typescript
import { useChatContext } from '@/features/chat/context';

const ChatComponent = () => {
  const { 
    currentRoom, 
    setCurrentRoom, 
    chatSettings, 
    isTyping 
  } = useChatContext();

  return (
    <View>
      {currentRoom && (
        <ThemedText>Current Room: {currentRoom.name}</ThemedText>
      )}
      {isTyping && (
        <ThemedText>AI is typing...</ThemedText>
      )}
    </View>
  );
};
```

### **Room Management**
```typescript
import { useChatContext } from '@/features/chat/context';

const RoomSelector = () => {
  const { currentRoom, setCurrentRoom } = useChatContext();

  const handleRoomSelect = (room: ChatRoom) => {
    setCurrentRoom(room);
  };

  return (
    <View>
      {rooms.map(room => (
        <RoomListItem
          key={room.id}
          room={room}
          isActive={currentRoom?.id === room.id}
          onPress={() => handleRoomSelect(room)}
        />
      ))}
    </View>
  );
};
```

### **Settings Management**
```typescript
import { useChatContext } from '@/features/chat/context';

const ChatSettings = () => {
  const { chatSettings, updateChatSettings } = useChatContext();

  const handleModelChange = (model: string) => {
    updateChatSettings({ defaultModel: model });
  };

  return (
    <View>
      <Picker
        selectedValue={chatSettings.defaultModel}
        onValueChange={handleModelChange}
      >
        <Picker.Item label="GPT-3.5" value="gpt-3.5-turbo" />
        <Picker.Item label="GPT-4" value="gpt-4" />
      </Picker>
    </View>
  );
};
```

### **Typing State Management**
```typescript
import { useChatContext } from '@/features/chat/context';

const ChatInput = () => {
  const { isTyping, setIsTyping } = useChatContext();

  const handleSend = async (message: string) => {
    setIsTyping(true);
    try {
      await sendMessage(message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <View>
      <TextInput 
        placeholder="Type a message..."
        editable={!isTyping}
      />
      {isTyping && (
        <ThemedText>AI is thinking...</ThemedText>
      )}
    </View>
  );
};
```

## 🔄 State Management

### **Room State Flow**
1. **No Room**: `currentRoom = null`
2. **Room Selected**: `currentRoom` populated with room data
3. **Room Change**: `currentRoom` updated to new room
4. **Room Clear**: `currentRoom` set back to `null`

### **Settings State**
- **Default Model**: AI model preference
- **Theme**: Light/dark mode preference
- **Auto-scroll**: Auto-scroll to new messages
- **Sound**: Message notification sounds

### **Typing State**
- **False**: AI is not responding
- **True**: AI is generating response
- **Auto-reset**: Automatically resets after response

## 🔗 Integration with Other Hooks

### **Chat Hooks Integration**
```typescript
import { useChatContext } from '@/features/chat/context';
import { useChat, useChatRooms } from '@/features/chat/hooks';

const ChatScreen = () => {
  const { currentRoom } = useChatContext();
  const { messages, sendMessage } = useChat(currentRoom?.id);
  const { rooms } = useChatRooms();

  const handleSend = (content: string) => {
    if (currentRoom) {
      sendMessage(content);
    }
  };
};
```

### **Navigation Integration**
```typescript
import { useChatContext } from '@/features/chat/context';
import { useNavigationCombined } from '@/shared/hooks';

const ChatHeader = () => {
  const { currentRoom } = useChatContext();
  const { navigateToHome } = useNavigationCombined();

  const handleBack = () => {
    if (currentRoom) {
      navigateToHome();
    }
  };
};
```

### **Error Handling Integration**
```typescript
import { useChatContext } from '@/features/chat/context';
import { useErrorStateCombined } from '@/shared/hooks';

const ChatComponent = () => {
  const { currentRoom } = useChatContext();
  const { setApiError } = useErrorStateCombined();

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      setApiError({
        context: 'chat',
        originalError: error,
        userMessage: 'Failed to send message'
      });
    }
  };
};
```

## 📋 Best Practices

### **1. Check Room State**
```typescript
// ✅ Good
const { currentRoom } = useChatContext();
if (!currentRoom) {
  return <NoRoomSelected />;
}

// ❌ Bad
const { currentRoom } = useChatContext();
// Directly use currentRoom without checking
```

### **2. Use Settings Consistently**
```typescript
// ✅ Good
const { chatSettings } = useChatContext();
const model = chatSettings.defaultModel;

// ❌ Bad
const model = 'gpt-3.5-turbo'; // Hardcoded value
```

### **3. Manage Typing State Properly**
```typescript
// ✅ Good
const { setIsTyping } = useChatContext();
setIsTyping(true);
try {
  await sendMessage(message);
} finally {
  setIsTyping(false);
}

// ❌ Bad
setIsTyping(true);
await sendMessage(message);
// Forgot to reset typing state
```

### **4. Avoid Context Overuse**
```typescript
// ✅ Good - Use context for global state
const { currentRoom, chatSettings } = useChatContext();

// ❌ Bad - Don't use context for local state
const [localMessage, setLocalMessage] = useState(''); // Use local state
```

## 🔗 Related Documentation

- [AuthContext](./auth.md) - Authentication state management
- [Components Catalog](../components/catalog.md) - Chat components
- [Services Architecture](../services/README.md) - Chat services 