# AuthContext Documentation

The `AuthContext` provides authentication state management throughout the ChatGPT Clone application.

## 📁 File Location

**Context**: `src/features/auth/context/AuthContext.tsx`  
**Hook**: `src/features/auth/context/index.ts`

## 🎯 Purpose

The `AuthContext` manages:
- User authentication state
- Session management
- Login/logout functionality
- User profile information

## 🔧 Implementation

### **Context Interface**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
}
```

### **useAuth Hook**
```typescript
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 📖 Usage Examples

### **Basic Usage**
```typescript
import { useAuth } from '@/features/auth/context';

const MyComponent = () => {
  const { user, session, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading authentication..." />;
  }

  if (!user) {
    return (
      <Button onPress={() => signIn('google')}>
        Sign in with Google
      </Button>
    );
  }

  return (
    <View>
      <ThemedText>Welcome, {user.email}!</ThemedText>
      <Button onPress={signOut}>Sign Out</Button>
    </View>
  );
};
```

### **Protected Routes**
```typescript
import { useAuth } from '@/features/auth/context';

const ProtectedComponent = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <ProtectedContent />;
};
```

### **Authentication in Services**
```typescript
import { useAuth } from '@/features/auth/context';

const useChatService = () => {
  const { session } = useAuth();

  const sendMessage = async (message: string) => {
    if (!session?.access_token) {
      throw new Error('No authentication token');
    }

    // Use session.access_token for API calls
    const response = await fetch('/api/chat', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
  };

  return { sendMessage };
};
```

## 🔄 State Management

### **Authentication Flow**
1. **Initial Load**: `loading = true`
2. **Session Check**: Verify existing session
3. **Authenticated**: `user` and `session` populated
4. **Unauthenticated**: `user = null`, `session = null`

### **State Updates**
- **Login**: Updates `user` and `session`, sets `loading = false`
- **Logout**: Clears `user` and `session`
- **Session Refresh**: Updates `session` with new tokens

## 🛡️ Security Features

- Automatic token refresh
- Secure token storage
- Token validation on API calls
- Session restoration on app restart
- Automatic logout on token expiration

## 🔗 Integration with Other Hooks

### **Error Handling**
```typescript
import { useAuth } from '@/features/auth/context';
import { useErrorStateCombined } from '@/shared/hooks';

const LoginComponent = () => {
  const { signIn } = useAuth();
  const { setAuthError } = useErrorStateCombined();

  const handleLogin = async () => {
    try {
      await signIn('google');
    } catch (error) {
      setAuthError({
        context: 'login',
        originalError: error,
        userMessage: 'Failed to sign in with Google'
      });
    }
  };
};
```

### **Navigation**
```typescript
import { useAuth } from '@/features/auth/context';
import { useNavigationCombined } from '@/shared/hooks';

const AuthGuard = () => {
  const { user, loading } = useAuth();
  const { navigateToLogin, navigateToHome } = useNavigationCombined();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigateToHome();
      } else {
        navigateToLogin();
      }
    }
  }, [user, loading, navigateToHome, navigateToLogin]);
};
```

## 📋 Best Practices

### **1. Always Check Loading State**
```typescript
// ✅ Good
const { user, loading } = useAuth();
if (loading) return <LoadingScreen />;
if (!user) return <LoginScreen />;

// ❌ Bad
const { user } = useAuth();
if (!user) return <LoginScreen />; // Might show during loading
```

### **2. Use Error Handling**
```typescript
// ✅ Good
const handleLogin = async () => {
  try {
    await signIn('google');
  } catch (error) {
    setAuthError({ context: 'login', originalError: error });
  }
};
```

### **3. Protect Sensitive Operations**
```typescript
// ✅ Good
const sendMessage = async (message: string) => {
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }
  // Proceed with authenticated request
};
```

## 🔗 Related Documentation

- [ChatContext](./chat.md) - Chat state management
- [Components Catalog](../components/catalog.md) - UI components
- [Services Architecture](../services/README.md) - Backend integration 