# Styling Guide for ChatGPT Clone

This document outlines the styling conventions and component system used in the ChatGPT Clone project. Following these guidelines will ensure consistent UI/UX across the application and improve development efficiency.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Theme System](#theme-system)
3. [UI Component Library](#ui-component-library)
4. [Style Organization](#style-organization)
5. [Best Practices](#best-practices)
6. [Migration Guide](#migration-guide)

## Core Principles

Our styling approach is built on these fundamental principles:

1. **Consistency**: Use the theme system and component library to maintain visual consistency.
2. **Co-location**: Keep styles close to the components that use them.
3. **Type Safety**: Leverage TypeScript for better developer experience and fewer errors.
4. **Reusability**: Use shared components rather than duplicating styles.
5. **Maintainability**: Organize styles in a way that makes them easy to update and extend.

## Theme System

The theme system is the foundation of our styling approach. It defines all design tokens used throughout the application.

### Theme Structure

```typescript
// Located at src/features/theme/theme.types.ts
export type AppTheme = {
  colors: {
    primary: string;
    secondary: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      avatar: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
      inverted: string;
    };
    // ... other color categories
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  // ... other theme properties
};
```

### Using the Theme

Always use the theme for styling values rather than hardcoding:

```typescript
// ❌ Bad - Hardcoded values
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
});

// ✅ Good - Using theme values
const styles = createStyles(theme => StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
}));
```

### Accessing the Theme

Use the `useAppTheme` hook to access the current theme:

```typescript
import { useAppTheme } from '@/features/theme/theme';

const MyComponent = () => {
  const theme = useAppTheme();
  const styles = createMyComponentStyles(theme);
  
  // ...
};
```

## UI Component Library

We've built a comprehensive UI component library to ensure consistency and reduce duplication. Always prefer these components over custom implementations.

### Available Components

1. **Button**
   - Variants: primary, secondary, outline, ghost, link
   - Sizes: xs, sm, md, lg, xl
   - Status: default, success, error, warning, info

   ```tsx
   <Button 
     variant="primary"
     size="md"
     label="Submit"
     onPress={handleSubmit}
     isLoading={isSubmitting}
   />
   ```

2. **Text**
   - Variants: h1, h2, h3, title, subtitle, body, caption, label, link, error, code
   - Weights: regular, medium, semibold, bold
   - Sizes: xs, sm, md, lg, xl, xxl

   ```tsx
   <Text 
     variant="title"
     weight="semibold"
     size="lg"
   >
     Welcome to ChatGPT Clone
   </Text>
   ```

3. **Input**
   - Variants: default, filled, outlined, underlined, search, chat
   - Status: default, success, error, warning

   ```tsx
   <Input
     label="Email"
     variant="filled"
     placeholder="Enter your email"
     value={email}
     onChangeText={setEmail}
     errorText={errors.email}
     status={errors.email ? 'error' : 'default'}
   />
   ```

4. **Card**
   - Variants: default, elevated, outlined, flat
   - Padding: none, sm, md, lg

   ```tsx
   <Card
     variant="elevated"
     padding="md"
     header={<Text variant="h3">Card Title</Text>}
   >
     <Text>Card content goes here</Text>
   </Card>
   ```

5. **ListItem**
   - Variants: default, settings, chat, menu
   - Sizes: sm, md, lg

   ```tsx
   <ListItem
     variant="settings"
     title="Notifications"
     subtitle="Manage notification preferences"
     leftElement={<Icon name="bell" />}
     rightElement={<Icon name="chevron-right" />}
     onPress={handlePress}
   />
   ```

### Component Props

All components are fully typed with TypeScript. Use your IDE's autocomplete to explore available props.

## Style Organization

### Co-location Pattern

Styles should be co-located with their components:

```
src/
  features/
    chat/
      components/
        ChatInput/
          index.tsx            # Component implementation
          ChatInput.styles.ts  # Component styles
```

### Style Creation Pattern

Use this pattern for creating styles:

```typescript
// ChatInput.styles.ts
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/features/theme/theme.types';

export const createChatInputStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.md,
    },
    // ... other styles
  });
};
```

Then in your component:

```typescript
// index.tsx
import { useAppTheme } from '@/features/theme/theme';
import { createChatInputStyles } from './ChatInput.styles';

export const ChatInput = () => {
  const theme = useAppTheme();
  const styles = createChatInputStyles(theme);
  
  // ... component implementation
};
```

## Best Practices

1. **Use the Component Library**
   - Always check if there's a component in the library before creating custom UI elements.
   - Extend existing components rather than creating new ones for similar use cases.

2. **Follow the Theme System**
   - Use theme values for all styling properties.
   - Don't hardcode colors, spacing, font sizes, etc.

3. **Maintain Type Safety**
   - Use the provided TypeScript interfaces for all styling.
   - Don't use `any` or ignore type errors.

4. **Keep Styles Co-located**
   - Always put styles in a separate `.styles.ts` file next to the component.
   - Use the `create[ComponentName]Styles` naming convention.

5. **Avoid Inline Styles**
   - Don't use inline styles except for dynamic values that can't be predetermined.
   - Even then, try to use conditional application of predefined styles.

6. **Responsive Design**
   - Use relative units and flexible layouts.
   - Test on multiple screen sizes.

## Migration Guide

When refactoring existing components to use the new styling system:

1. **Identify UI Elements to Replace**
   - Replace `TouchableOpacity` with `Button`
   - Replace `Text` with our `Text` component
   - Replace `TextInput` with our `Input` component
   - Replace container `View`s with `Card` where appropriate
   - Replace list items with `ListItem`

2. **Create a Co-located Style File**
   - Move styles from global style files to component-specific style files.
   - Update style references in the component.

3. **Apply Theme Values**
   - Replace hardcoded values with theme references.

4. **Test Thoroughly**
   - Verify that the refactored component looks and behaves the same as before.
   - Test edge cases like error states, loading states, etc.

---

By following these guidelines, we'll maintain a consistent, maintainable, and visually appealing UI across the entire application. If you have questions or suggestions, please discuss with the team before making significant changes to the styling system.
