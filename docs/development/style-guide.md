# React Native Coding Standards

This document outlines the coding standards and patterns for our React Native chat application. Following these guidelines ensures consistency, maintainability, and scalability across the codebase.

## Core Coding Principles

1. **Component Structure**: Each component has its own file with dedicated style file
2. **TypeScript First**: Use TypeScript for all components and functions
3. **Hook Patterns**: Follow established hook patterns for state management
4. **Error Handling**: Use centralized error handling patterns
5. **Performance**: Follow React Native best practices for performance

## Component Structure

### File Organization
```
ComponentName/
├── index.tsx          # Main component
├── ComponentName.styles.ts  # Styles
└── ComponentName.test.tsx   # Tests (if needed)
```

### Component Template
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { createComponentStyles } from './ComponentName.styles';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  const styles = createComponentStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default ComponentName;
```

## TypeScript Patterns

### Interface Naming
```typescript
// ✅ Good - Descriptive interface names
interface ChatMessageProps {
  message: ChatMessage;
  isTyping?: boolean;
  onRegenerate?: () => void;
}

// ❌ Bad - Generic names
interface Props {
  data: any;
  callback?: Function;
}
```

### Type Definitions
```typescript
// ✅ Good - Specific types
type MessageRole = 'user' | 'assistant';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ❌ Bad - Generic types
type Data = any;
type Callback = Function;
```

### Hook Return Types
```typescript
// ✅ Good - Explicit return types
const useChat = (roomId: number | null): {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  loading: boolean;
} => {
  // Implementation
};

// ❌ Bad - Implicit return types
const useChat = (roomId) => {
  // Implementation
};
```

## React Native Specific Patterns

### Platform-Specific Code
```typescript
// ✅ Good - Platform-specific components
import { Platform } from 'react-native';

const Button = ({ onPress, title }) => {
  if (Platform.OS === 'ios') {
    return <IOSButton onPress={onPress} title={title} />;
  }
  return <AndroidButton onPress={onPress} title={title} />;
};

// ✅ Good - Platform-specific styles
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

### Touchable Components
```typescript
// ✅ Good - Use appropriate touchable component
import { TouchableOpacity, TouchableHighlight, Pressable } from 'react-native';

// For buttons and interactive elements
<TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
  <Text>Button</Text>
</TouchableOpacity>

// For list items with feedback
<TouchableHighlight onPress={handlePress} underlayColor="#f0f0f0">
  <View>
    <Text>List Item</Text>
  </View>
</TouchableHighlight>

// For complex interactions
<Pressable 
  onPress={handlePress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  <Text>Complex Interaction</Text>
</Pressable>
```

### FlatList Optimization
```typescript
// ✅ Good - Optimized FlatList
const ChatMessageList = ({ messages }) => {
  const renderItem = useCallback(({ item }) => (
    <ChatMessageBubble message={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
};
```

### Image Handling
```typescript
// ✅ Good - Image with error handling
import { Image } from 'react-native';

const Avatar = ({ uri, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Image
      source={imageError ? require('../assets/default-avatar.png') : { uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setImageError(true)}
    />
  );
};
```

## Hook Patterns

### Custom Hook Structure
```typescript
// ✅ Good - Well-structured custom hook
export const useChat = (roomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!roomId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newMessage = await chatService.sendMessage(roomId, content);
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
```

### Hook Dependencies
```typescript
// ✅ Good - Proper dependency management
const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { user } = useAuth();

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    const userRooms = await chatService.getRooms(user.id);
    setRooms(userRooms);
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, refetch: fetchRooms };
};
```

## Error Handling Patterns

### Try-Catch in Async Functions
```typescript
// ✅ Good - Proper error handling
const handleSendMessage = async (content: string) => {
  try {
    setLoading(true);
    await sendMessage(content);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Error Boundaries
```typescript
// ✅ Good - Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

## Performance Patterns

### Memoization
```typescript
// ✅ Good - Memoize expensive components
const ExpensiveComponent = React.memo(({ data, onPress }) => {
  return (
    <View>
      {data.map(item => (
        <ListItem key={item.id} item={item} onPress={onPress} />
      ))}
    </View>
  );
});

// ✅ Good - Memoize callbacks
const ParentComponent = () => {
  const handleItemPress = useCallback((itemId: string) => {
    // Handle item press
  }, []);

  return <ExpensiveComponent data={data} onPress={handleItemPress} />;
};
```

### Lazy Loading
```typescript
// ✅ Good - Lazy load components
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

const App = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LazyComponent />
    </Suspense>
  );
};
```

## Navigation Patterns

### Route Parameters
```typescript
// ✅ Good - Type-safe route parameters
type RootStackParamList = {
  Home: undefined;
  Chat: { roomId: number; roomName: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const ChatScreen = ({ route }) => {
  const { roomId, roomName } = route.params;
  // Use roomId and roomName
};
```

### Navigation Actions
```typescript
// ✅ Good - Centralized navigation
const useNavigationActions = () => {
  const navigation = useNavigation();

  const navigateToChat = useCallback((roomId: number, roomName: string) => {
    navigation.navigate('Chat', { roomId, roomName });
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { navigateToChat, goBack };
};
```

## Testing Patterns

### Component Testing
```typescript
// ✅ Good - Component test structure
import { render, fireEvent } from '@testing-library/react-native';

describe('ChatInput', () => {
  it('should call onSend when send button is pressed', () => {
    const onSend = jest.fn();
    const { getByText } = render(<ChatInput onSend={onSend} />);
    
    fireEvent.press(getByText('Send'));
    expect(onSend).toHaveBeenCalled();
  });
});
```

### Hook Testing
```typescript
// ✅ Good - Hook testing
import { renderHook, act } from '@testing-library/react-hooks';

describe('useChat', () => {
  it('should send message successfully', async () => {
    const { result } = renderHook(() => useChat(1));
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.messages).toHaveLength(1);
  });
});
```

## Code Organization

### Import Order
```typescript
// ✅ Good - Organized imports
// 1. React and React Native
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native';

// 3. Internal components and hooks
import { useAuth } from '@/features/auth/context';
import { ThemedText } from '@/shared/components';

// 4. Styles and types
import { createComponentStyles } from './ComponentName.styles';
import type { ComponentNameProps } from './types';
```

### Export Patterns
```typescript
// ✅ Good - Named exports for utilities, default for components
export { useChat, useChatRooms } from './hooks';
export { ChatMessage, ChatRoom } from './types';
export default ChatComponent;
```

## What to Avoid

1. **Inline Styles**: Don't define styles directly in components
2. **Any Types**: Avoid using `any` type in TypeScript
3. **Large Components**: Keep components focused and small
4. **Side Effects in Render**: Don't perform side effects during render
5. **Missing Error Handling**: Always handle potential errors
6. **Hardcoded Values**: Use constants and theme values instead
7. **Unnecessary Re-renders**: Avoid causing unnecessary component updates

## Best Practices Summary

- Use TypeScript for all new code
- Follow established component patterns
- Implement proper error handling
- Optimize for performance with memoization
- Test components and hooks thoroughly
- Keep components small and focused
- Use proper naming conventions
- Document complex logic with comments
