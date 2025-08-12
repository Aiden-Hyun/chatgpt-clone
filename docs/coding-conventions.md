# Project Coding Conventions

This document outlines the coding conventions and best practices to be followed when contributing to this project. Adhering to these guidelines ensures code consistency, maintainability, and quality.

## 1. Authentication

To ensure we handle user sessions consistently and avoid race conditions, follow these rules for accessing authentication state.

- **DO** use the `useAuth()` hook within React components and hooks to access the user session and profile.

  ```typescript
  // Good ✅
  import { useAuth } from '@/features/auth';

  const MyComponent = () => {
    const { session, profile } = useAuth();
    // ...
  };
  ```

- **DON'T** call `supabase.auth.getSession()` directly from a React component. The `useAuth` hook provides a centralized, context-aware state.

  ```typescript
  // Bad ❌
  import { supabase } from '@/shared/lib/supabase';

  const MyComponent = () => {
    // This bypasses the AuthContext and can lead to inconsistent state.
    const { data } = await supabase.auth.getSession();
    // ...
  };
  ```
  > **Exception**: Non-hook services (like `MessageSenderService`) that run outside the React component tree may use the `src/shared/lib/supabase/getSession.ts` utility as they cannot use hooks.

## 2. Error Handling

A consistent error handling strategy is crucial for a good user experience.

- **DO** use the `useToast()` hook to display non-blocking, user-friendly error messages for most scenarios (e.g., failed API calls, validation errors).

  ```typescript
  // Good ✅
  import { useToast } from '@/features/alert';
  
  const { showError } = useToast();
  
  try {
    // ... some action
  } catch (error) {
    showError('Something went wrong. Please try again.');
  }
  ```

- **DON'T** use the native `Alert.alert()` for simple errors. It is a blocking UI element and should be reserved for actions that require explicit user confirmation (e.g., "Are you sure you want to delete this chat?").

- **DON'T** swallow errors by only logging them to the console. If an operation fails, the user should receive feedback.

## 3. Navigation

To prevent bugs and keep navigation simple and predictable, we rely directly on the `expo-router` library.

- **DO** use the `router` object from `expo-router` for all navigation actions.
  - `router.push('/path')`: To navigate to a new screen.
  - `router.back()`: To go back to the previous screen in the history stack.
  - `router.replace('/path')`: To navigate and replace the current screen in the history (ideal for login/logout flows).

  ```typescript
  // Good ✅
  import { router } from 'expo-router';

  const handlePress = () => {
    router.push('/settings');
  };

  const handleGoBack = () => {
    router.back();
  }
  ```

- **DON'T** create custom navigation hooks or wrappers (e.g., `useNavigationCombined`, `useNavigationActions`). These were found to be unstable and have been removed from the project.

## 4. Styling

- **DO** use the `create...Styles` pattern along with the `useAppTheme` hook to create styles for components. This ensures all UI elements are theme-aware.

- **DON'T** use inline styles or hardcoded color/font values. Always reference values from the theme.
