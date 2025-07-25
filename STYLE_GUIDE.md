# React Native Chat App Style Guide

This document outlines the styling conventions for our React Native chat application. Following these guidelines ensures consistency, maintainability, and scalability across the codebase.

## Core Styling Principles

1. **Unified Theme System**: All design tokens are defined in a single `theme.ts` file with light and dark variants
2. **Dark Mode Support**: All components automatically adapt to system color scheme
3. **Component-Specific Style Files**: Each component has its own `.styles.ts` file that exports theme-aware functions
4. **No Inline Styles**: Avoid inline styles except for dynamic, runtime-calculated styles
5. **No Hardcoded Values**: Use theme constants instead of hardcoded values

## Theme System

Our application uses a unified theme system defined in `src/shared/lib/theme.ts`. This file contains all design tokens with both light and dark variants:

- Colors (light and dark variants)
- Font sizes
- Font weights
- Font families
- Spacing
- Border radius
- Shadows (theme-aware)
- Letter spacing
- Interactive states

### Using the Theme Hook

Always use the `useAppTheme()` hook to access the current theme:

```typescript
import { useAppTheme } from '../shared/hooks';

const MyComponent = () => {
  const theme = useAppTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: theme.fontSizes.md,
    },
  });
  
  return <View style={styles.container}>...</View>;
};
```

### Theme Structure

```typescript
const theme = {
  colors: {
    primary: '#000000', // Light: black, Dark: white
    background: {
      primary: '#FFFFFF', // Light: white, Dark: #151718
      secondary: '#F5F5F5', // Light: light gray, Dark: #1F2021
    },
    text: {
      primary: '#000000', // Light: black, Dark: #ECEDEE
      secondary: '#333333', // Light: dark gray, Dark: #D1D5DB
    },
    status: {
      error: '#DC2626', // Light: red, Dark: #EF4444
      success: '#16A34A', // Light: green, Dark: #22C55E
      warning: '#D97706', // Light: orange, Dark: #F59E0B
      info: '#2563EB', // Light: blue, Dark: #3B82F6
    },
    interactive: {
      hover: 'rgba(0, 0, 0, 0.05)', // Light: black overlay, Dark: white overlay
      pressed: 'rgba(0, 0, 0, 0.1)',
      focus: 'rgba(0, 0, 0, 0.1)',
    },
  },
  // ... other design tokens
};
```

## Component Style Files

Each component should have a dedicated `.styles.ts` file that:

1. Exports a function that returns styles based on the current theme
2. Uses `useAppTheme()` hook to access theme tokens
3. Defines styles using `StyleSheet.create()`

### Naming Convention

Style files should follow this naming pattern:
- Component file: `ComponentName.tsx`
- Style file: `ComponentName.styles.ts`
- Style function: `createComponentNameStyles()`

### Example Style File

```typescript
// ChatMessageBubble.styles.ts
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../shared/hooks';

export const createChatMessageBubbleStyles = () => {
  const theme = useAppTheme();
  
  return StyleSheet.create({
    container: {
      marginVertical: theme.spacing.sm,
      flexDirection: 'row',
    },
    messageBubble: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      maxWidth: '80%',
      ...theme.shadows.light,
    },
    userBubble: {
      backgroundColor: theme.colors.message.user,
      alignSelf: 'flex-end',
    },
    assistantBubble: {
      backgroundColor: theme.colors.message.assistant,
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      letterSpacing: theme.letterSpacing.normal,
    },
    userText: {
      color: theme.colors.message.userText,
    },
    assistantText: {
      color: theme.colors.message.assistantText,
    },
  });
};
```

## Using Styles in Components

Import and apply styles from the dedicated style file:

```typescript
// ChatMessageBubble.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { createChatMessageBubbleStyles } from './ChatMessageBubble.styles';

const ChatMessageBubble = ({ message, isUser }) => {
  const styles = createChatMessageBubbleStyles();
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.assistantText
        ]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
};

export default ChatMessageBubble;
```

## Style Naming Conventions

Follow these naming conventions for style objects:

### Layout Components
- `container`: The outermost wrapper of a component
- `wrapper`: Secondary wrapper inside a container
- `row`: Horizontal layout container
- `column`: Vertical layout container
- `center`: Container with centered content

### UI Elements
- `button`: Base button style
- `buttonPrimary`, `buttonSecondary`: Variant-specific button styles
- `buttonPressed`, `buttonDisabled`: State-specific button styles
- `input`: Text input style
- `icon`: Icon style
- `avatar`: User avatar style

### Text Elements
- `title`: Primary heading
- `subtitle`: Secondary heading
- `text`: Regular text
- `label`: Form label text
- `errorText`: Error message text
- `successText`: Success message text

### Modifiers (as separate style keys)
- `disabled`: For disabled state
- `active`: For active/selected state
- `error`: For error state
- `success`: For success state
- `warning`: For warning state
- `highlighted`: For highlighted state

## Handling Dynamic Styles

For styles that need to be calculated at runtime:

1. Define base styles in the style file
2. Apply dynamic properties in the component using style arrays or computed properties

```typescript
// Good: Dynamic style with style arrays
<View style={[
  styles.container,
  isActive && styles.activeContainer,
  { opacity: calculateOpacity() }
]}>

// Bad: Completely inline style
<View style={{
  padding: 16,
  backgroundColor: isActive ? '#000' : '#FFF',
  opacity: calculateOpacity()
}}>
```

## Semantic Colors

Use semantic colors for better accessibility and consistency:

```typescript
const styles = StyleSheet.create({
  successMessage: {
    color: theme.colors.status.success,
  },
  errorMessage: {
    color: theme.colors.status.error,
  },
  warningMessage: {
    color: theme.colors.status.warning,
  },
  infoMessage: {
    color: theme.colors.status.info,
  },
});
```

## Interactive States

Implement interactive states for better UX:

```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.button.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonPressed: {
    backgroundColor: theme.colors.interactive.pressed,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.button.disabled,
    opacity: 0.6,
  },
});
```

## What to Avoid

1. **Inline Styles**: Don't define styles directly in the component JSX
   ```typescript
   // Avoid this
   <Text style={{ fontSize: 16, color: '#000' }}>Hello</Text>
   
   // Use this instead
   <Text style={styles.text}>Hello</Text>
   ```

2. **Hardcoded Values**: Don't use literal values for colors, spacing, etc.
   ```typescript
   // Avoid this
   marginBottom: 16,
   color: '#000000',
   
   // Use this instead
   marginBottom: theme.spacing.lg,
   color: theme.colors.text.primary,
   ```

3. **Old Theme Imports**: Don't import from the old theme system
   ```typescript
   // Avoid this
   import { colors, spacing } from '../lib/theme';
   
   // Use this instead
   import { useAppTheme } from '../hooks';
   ```

4. **Inconsistent Naming**: Don't use different names for similar styles across components

5. **Mixed Style Approaches**: Don't mix different styling methods (StyleSheet, inline, styled-components)

## TypeScript Type Safety

When using font weights with TypeScript, use type assertions to ensure type safety:

```typescript
fontWeight: theme.fontWeights.medium as '500',
```

## Responsive Design

For responsive styles that adapt to different screen sizes:

1. Use relative units (percentages) where appropriate
2. Use the `Dimensions` API for screen-size dependent styles
3. Consider creating responsive helpers in the theme file

## Accessibility

Ensure styles support accessibility:

1. Use sufficient color contrast (handled by theme)
2. Ensure touch targets are at least 44x44 points
3. Support dynamic text sizes
4. Use semantic colors for status indicators

## Dark Mode Testing

Always test your components in both light and dark modes:

1. Enable dark mode on your device/simulator
2. Verify all text is readable
3. Check that interactive elements have proper contrast
4. Ensure status colors are appropriate for both themes

## Performance Considerations

- Style functions are called on every render, but StyleSheet.create() is optimized
- Consider memoizing styles for complex components if needed
- The theme hook is lightweight and won't impact performance

---

By following these styling guidelines, we maintain a consistent, maintainable, and scalable codebase that supports both light and dark modes and is easier to work with for all developers on the project.
