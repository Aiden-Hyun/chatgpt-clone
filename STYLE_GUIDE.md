# React Native Chat App Style Guide

This document outlines the styling conventions for our React Native chat application. Following these guidelines ensures consistency, maintainability, and scalability across the codebase.

## Core Styling Principles

1. **Centralized Theme System**: All design tokens are defined in a single `theme.ts` file
2. **Component-Specific Style Files**: Each component has its own `.styles.ts` file
3. **No Inline Styles**: Avoid inline styles except for dynamic, runtime-calculated styles
4. **No Hardcoded Values**: Use theme constants instead of hardcoded values

## Theme System

Our application uses a centralized theme system defined in `src/theme.ts`. This file contains all design tokens:

- Colors
- Font sizes
- Font weights
- Font families
- Spacing
- Border radius
- Shadows
- Letter spacing

### Example of Theme Usage

```typescript
// Import specific tokens from theme
import { colors, fontSizes, spacing } from '../src/theme';

// Or import the entire theme
import theme from '../src/theme';
```

## Component Style Files

Each component should have a dedicated `.styles.ts` file that:

1. Imports necessary theme tokens
2. Defines styles using `StyleSheet.create()`
3. Exports styles for use in the component

### Naming Convention

Style files should follow this naming pattern:
- Component file: `ComponentName.tsx`
- Style file: `ComponentName.styles.ts`

### Example Style File

```typescript
// ChatMessageBubble.styles.ts
import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows, fontFamily, fontWeights, letterSpacing } from '../theme';

export const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    flexDirection: 'row',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.message.user,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: colors.message.assistant,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: fontSizes.md,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.normal,
  },
});
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
- `input`: Text input style
- `icon`: Icon style
- `avatar`: User avatar style

### Text Elements
- `title`: Primary heading
- `subtitle`: Secondary heading
- `text`: Regular text
- `label`: Form label text
- `errorText`: Error message text

### Modifiers (as separate style keys)
- `disabled`: For disabled state
- `active`: For active/selected state
- `error`: For error state
- `highlighted`: For highlighted state

## Using Styles in Components

Import and apply styles from the dedicated style file:

```typescript
// ChatMessageBubble.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './ChatMessageBubble.styles';

const ChatMessageBubble = ({ message, isUser }) => {
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
   marginBottom: spacing.lg,
   color: colors.text.primary,
   ```

3. **Inconsistent Naming**: Don't use different names for similar styles across components

4. **Mixed Style Approaches**: Don't mix different styling methods (StyleSheet, inline, styled-components)

## TypeScript Type Safety

When using font weights with TypeScript, use type assertions to ensure type safety:

```typescript
fontWeight: fontWeights.medium as '500',
```

## Responsive Design

For responsive styles that adapt to different screen sizes:

1. Use relative units (percentages) where appropriate
2. Use the `Dimensions` API for screen-size dependent styles
3. Consider creating responsive helpers in the theme file

## Accessibility

Ensure styles support accessibility:

1. Use sufficient color contrast
2. Ensure touch targets are at least 44x44 points
3. Support dynamic text sizes

---

By following these styling guidelines, we maintain a consistent, maintainable, and scalable codebase that's easier to work with for all developers on the project.
