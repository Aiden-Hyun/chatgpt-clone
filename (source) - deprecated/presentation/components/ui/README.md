# UI Components Library

This library provides a set of reusable UI components that follow the layered architecture principles defined in `conventions_summary.md`.

## Architecture

The UI components are part of the presentation layer and follow these principles:

1. **No Business Logic**: Components only handle UI concerns and delegate business logic to the business layer.
2. **Dependency Injection**: Components receive dependencies through context providers.
3. **Theme Integration**: Components use the theme system from the business layer.
4. **Consistent Styling**: Components use consistent styling patterns.

## Components

- **Button**: A versatile button component with various styles, sizes, and states.
- **Card**: A container component with various styles and padding options.
- **Dropdown**: A dropdown menu component.
- **Input**: A text input component with various styles, sizes, and states.
- **ListItem**: A list item component for use in lists and menus.
- **Text**: A text component with various styles, sizes, and weights.

## Usage

```tsx
import { Button, Card, Text } from '../../../presentation/components/ui';

function MyComponent() {
  return (
    <Card variant="elevated" padding="md">
      <Text size="lg" weight="bold">Hello World</Text>
      <Button 
        variant="primary" 
        label="Click Me" 
        onPress={() => console.log('Button clicked')} 
      />
    </Card>
  );
}
```

## Hooks

- **useComponentStyles**: A hook to provide consistent access to theme values for UI components.
- **useComponentTheme**: A hook to access the theme directly for UI components.
- **useComponentThemeStyle**: A hook to access theme styles for UI components.

## Context

- **ComponentsProvider**: A provider for UI component-specific dependencies.
- **useComponentsContext**: A hook to access UI component-specific context.

## Utilities

- **mergeStyles**: Merges multiple style objects into one.
- **createConditionalStyles**: Creates a style object with conditional values.
- **createResponsiveStyles**: Creates responsive styles based on theme breakpoints.
