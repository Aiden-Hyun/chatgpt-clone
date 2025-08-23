# Styling Cheat Sheet

## Quick Reference for UI Components

### Button

```tsx
import { Button } from '@/components';

// Primary button (default action)
<Button 
  variant="primary"  // primary, secondary, outline, ghost, link
  size="md"          // xs, sm, md, lg, xl
  label="Submit"     // button text
  onPress={handleSubmit}
  isLoading={isSubmitting}
  fullWidth          // takes full width of container
/>

// Link button
<Button 
  variant="link"
  label="Forgot Password?"
  onPress={handleForgotPassword}
/>

// Icon button
<Button 
  variant="ghost"
  size="sm"
  leftIcon={<Icon name="settings" />}
  onPress={handleSettings}
/>
```

### Text

```tsx
import { Text } from '@/components';

// Heading
<Text variant="h1">Page Title</Text>

// Body text with custom weight and color
<Text 
  variant="body"     // h1, h2, h3, title, subtitle, body, caption, label, link, error, code
  weight="medium"    // regular, medium, semibold, bold
  size="md"          // xs, sm, md, lg, xl, xxl
  color={theme.colors.primary}
>
  This is some text content
</Text>

// Error message
<Text variant="error">Something went wrong</Text>
```

### Input

```tsx
import { Input } from '@/components';

// Standard input
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  variant="filled"    // default, filled, outlined, underlined, search, chat
/>

// Input with error
<Input
  label="Password"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
  errorText="Password must be at least 8 characters"
  status="error"      // default, success, error, warning
/>
```

### Card

```tsx
import { Card } from '@/components';

// Basic card
<Card padding="md">
  <Text>Card content</Text>
</Card>

// Card with header and footer
<Card
  variant="elevated"  // default, elevated, outlined, flat
  padding="lg"        // none, sm, md, lg
  header={<Text variant="h3">Card Title</Text>}
  footer={<Button label="Action" size="sm" />}
>
  <Text>Main content of the card</Text>
</Card>

// Pressable card
<Card 
  pressable
  onPress={handlePress}
>
  <Text>Tap me!</Text>
</Card>
```

### ListItem

```tsx
import { ListItem } from '@/components';

// Basic list item
<ListItem
  title="Item Title"
  subtitle="Item description"
  onPress={handlePress}
/>

// Settings-style list item
<ListItem
  variant="settings"  // default, settings, chat, menu
  size="md"           // sm, md, lg
  title="Notifications"
  subtitle="Manage notification preferences"
  leftElement={<Icon name="bell" />}
  rightElement={<Icon name="chevron-right" />}
  onPress={handlePress}
/>

// Selected state
<ListItem
  title="Selected Item"
  selected={true}
  onPress={handlePress}
/>
```

## Theme Usage

```tsx
import { useAppTheme } from '@/features/theme/theme';

const MyComponent = () => {
  const theme = useAppTheme();
  
  // Access theme properties
  const backgroundColor = theme.colors.background.primary;
  const padding = theme.spacing.md;
  const fontSize = theme.fontSizes.md;
  
  // Use in styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor,
      padding,
      borderRadius: theme.borderRadius.md,
    },
    text: {
      fontSize,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium,
    }
  });
  
  // ...
};
```

## Creating Component Styles

```tsx
// MyComponent.styles.ts
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/features/theme/theme.types';

export const createMyComponentStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
    },
    title: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.text.primary,
    },
    // ... other styles
  });
};

// MyComponent.tsx
import { useAppTheme } from '@/features/theme/theme';
import { createMyComponentStyles } from './MyComponent.styles';

export const MyComponent = () => {
  const theme = useAppTheme();
  const styles = createMyComponentStyles(theme);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Component</Text>
    </View>
  );
};
```

## Common Patterns

### Conditional Styling

```tsx
// Based on props
<View style={[
  styles.base,
  isActive && styles.active,
  isDisabled && styles.disabled
]} />

// Based on theme
<View style={[
  styles.container,
  { borderColor: isError ? theme.colors.status.error.primary : theme.borders.colors.light }
]} />
```

### Responsive Layouts

```tsx
// Flex-based layouts
<View style={{ 
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}} />

// Percentage-based widths
<View style={{ width: '50%' }} />
```

### Platform-Specific Styling

```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow.dark,
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

Remember: Always use the theme system and component library before creating custom styles!
