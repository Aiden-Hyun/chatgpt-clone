# Enhanced Semantic Color Tokens Guide

This guide demonstrates how to use the comprehensive semantic color system that provides consistent, accessible, and meaningful color usage across your application.

## 🎨 **Enhanced Color System Overview**

The new semantic color system provides:

- **5 Status Categories**: Success, Error, Warning, Info, Neutral
- **4 Interactive States**: Hover, Pressed, Focus, Disabled
- **4 Feedback Types**: Loading, Highlight, Selection, Overlay
- **Multiple Intensity Levels**: Primary, Secondary, Tertiary
- **Context-Specific Variants**: Background, Border, Text

## 📋 **Status Colors**

### **Success States**
Use for positive actions, confirmations, and successful operations.

```typescript
const theme = useAppTheme();

const styles = StyleSheet.create({
  // Success button
  successButton: {
    backgroundColor: theme.colors.status.success.primary,
    borderColor: theme.colors.status.success.border,
  },
  
  // Success message background
  successMessage: {
    backgroundColor: theme.colors.status.success.background,
    borderColor: theme.colors.status.success.border,
  },
  
  // Success text
  successText: {
    color: theme.colors.status.success.primary,
  },
});
```

### **Error States**
Use for errors, failures, and destructive actions.

```typescript
const styles = StyleSheet.create({
  // Error alert
  errorAlert: {
    backgroundColor: theme.colors.status.error.background,
    borderColor: theme.colors.status.error.border,
  },
  
  // Error text
  errorText: {
    color: theme.colors.status.error.primary,
  },
  
  // Delete button
  deleteButton: {
    backgroundColor: theme.colors.status.error.primary,
    color: theme.colors.text.inverted,
  },
});
```

### **Warning States**
Use for warnings, cautions, and attention-grabbing elements.

```typescript
const styles = StyleSheet.create({
  // Warning banner
  warningBanner: {
    backgroundColor: theme.colors.status.warning.background,
    borderColor: theme.colors.status.warning.border,
  },
  
  // Warning icon
  warningIcon: {
    color: theme.colors.status.warning.primary,
  },
});
```

### **Info States**
Use for informational content, tips, and neutral actions.

```typescript
const styles = StyleSheet.create({
  // Info card
  infoCard: {
    backgroundColor: theme.colors.status.info.background,
    borderColor: theme.colors.status.info.border,
  },
  
  // Info link
  infoLink: {
    color: theme.colors.status.info.primary,
  },
});
```

### **Neutral States**
Use for disabled states, placeholders, and secondary information.

```typescript
const styles = StyleSheet.create({
  // Disabled input
  disabledInput: {
    backgroundColor: theme.colors.status.neutral.background,
    borderColor: theme.colors.status.neutral.border,
  },
  
  // Placeholder text
  placeholderText: {
    color: theme.colors.status.neutral.primary,
  },
});
```

## 🖱️ **Interactive States**

### **Hover States**
Use for mouse hover effects and touch feedback.

```typescript
const styles = StyleSheet.create({
  // Button with hover effect
  button: {
    backgroundColor: theme.colors.button.primary,
  },
  
  buttonHover: {
    backgroundColor: theme.colors.interactive.hover.primary,
  },
});
```

### **Pressed States**
Use for active/pressed button states.

```typescript
const styles = StyleSheet.create({
  buttonPressed: {
    backgroundColor: theme.colors.interactive.pressed.primary,
    transform: [{ scale: 0.98 }],
  },
});
```

### **Focus States**
Use for keyboard navigation and accessibility.

```typescript
const styles = StyleSheet.create({
  input: {
    borderColor: theme.colors.border.medium,
  },
  
  inputFocused: {
    borderColor: theme.colors.status.info.primary,
    backgroundColor: theme.colors.interactive.focus.primary,
  },
});
```

### **Disabled States**
Use for disabled interactive elements.

```typescript
const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: theme.colors.interactive.disabled.primary,
    opacity: 0.6,
  },
  
  textDisabled: {
    color: theme.colors.interactive.disabled.primary,
  },
});
```

## 🔄 **Feedback Colors**

### **Loading States**
Use for loading indicators and skeleton screens.

```typescript
const styles = StyleSheet.create({
  // Loading spinner
  loadingSpinner: {
    color: theme.colors.feedback.loading.primary,
  },
  
  // Skeleton background
  skeleton: {
    backgroundColor: theme.colors.feedback.loading.pulse,
  },
});
```

### **Highlight States**
Use for highlighting important content or search results.

```typescript
const styles = StyleSheet.create({
  // Search highlight
  searchHighlight: {
    backgroundColor: theme.colors.feedback.highlight.primary,
  },
  
  // Important text
  importantText: {
    backgroundColor: theme.colors.feedback.highlight.secondary,
  },
});
```

### **Selection States**
Use for text selection and item selection.

```typescript
const styles = StyleSheet.create({
  // Selected item
  selectedItem: {
    backgroundColor: theme.colors.feedback.selection.primary,
  },
  
  // Text selection
  textSelection: {
    backgroundColor: theme.colors.feedback.selection.secondary,
  },
});
```

### **Overlay States**
Use for modals, tooltips, and overlays.

```typescript
const styles = StyleSheet.create({
  // Modal backdrop
  modalBackdrop: {
    backgroundColor: theme.colors.feedback.overlay.medium,
  },
  
  // Tooltip background
  tooltip: {
    backgroundColor: theme.colors.background.primary,
    shadowColor: theme.colors.feedback.overlay.dark,
  },
});
```

## 🎯 **Practical Examples**

### **Enhanced Button Component**

```typescript
const EnhancedButton = ({ 
  variant = 'primary', 
  status = 'default', 
  disabled = false,
  onPress 
}) => {
  const theme = useAppTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  const getButtonColors = () => {
    if (disabled) {
      return {
        background: theme.colors.interactive.disabled.primary,
        text: theme.colors.interactive.disabled.primary,
      };
    }
    
    if (status === 'success') {
      return {
        background: theme.colors.status.success.primary,
        text: theme.colors.text.inverted,
      };
    }
    
    if (status === 'error') {
      return {
        background: theme.colors.status.error.primary,
        text: theme.colors.text.inverted,
      };
    }
    
    return {
      background: theme.colors.button.primary,
      text: theme.colors.button.text,
    };
  };
  
  const colors = getButtonColors();
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      opacity: disabled ? 0.6 : 1,
      transform: [{ scale: isPressed ? 0.98 : 1 }],
    },
    text: {
      color: colors.text,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
    },
  });
  
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Text style={styles.text}>Button Text</Text>
    </TouchableOpacity>
  );
};
```

### **Status Message Component**

```typescript
const StatusMessage = ({ type, title, message }) => {
  const theme = useAppTheme();
  
  const getStatusColors = () => {
    switch (type) {
      case 'success':
        return {
          background: theme.colors.status.success.background,
          border: theme.colors.status.success.border,
          icon: theme.colors.status.success.primary,
          text: theme.colors.status.success.primary,
        };
      case 'error':
        return {
          background: theme.colors.status.error.background,
          border: theme.colors.status.error.border,
          icon: theme.colors.status.error.primary,
          text: theme.colors.status.error.primary,
        };
      case 'warning':
        return {
          background: theme.colors.status.warning.background,
          border: theme.colors.status.warning.border,
          icon: theme.colors.status.warning.primary,
          text: theme.colors.status.warning.primary,
        };
      case 'info':
        return {
          background: theme.colors.status.info.background,
          border: theme.colors.status.info.border,
          icon: theme.colors.status.info.primary,
          text: theme.colors.status.info.primary,
        };
      default:
        return {
          background: theme.colors.status.neutral.background,
          border: theme.colors.status.neutral.border,
          icon: theme.colors.status.neutral.primary,
          text: theme.colors.status.neutral.primary,
        };
    }
  };
  
  const colors = getStatusColors();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.xs,
    },
    message: {
      color: colors.text,
      fontSize: theme.fontSizes.sm,
      opacity: 0.8,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};
```

## 🎨 **Color Intensity Guidelines**

### **Primary Colors**
- **Use for**: Main actions, primary buttons, important text
- **Examples**: `theme.colors.status.success.primary`

### **Secondary Colors**
- **Use for**: Secondary actions, less important elements
- **Examples**: `theme.colors.status.success.secondary`

### **Tertiary Colors**
- **Use for**: Subtle accents, decorative elements
- **Examples**: `theme.colors.status.success.tertiary`

### **Background Colors**
- **Use for**: Background fills, cards, containers
- **Examples**: `theme.colors.status.success.background`

### **Border Colors**
- **Use for**: Borders, dividers, outlines
- **Examples**: `theme.colors.status.success.border`

## 🔍 **Best Practices**

1. **Consistency**: Always use semantic colors instead of hardcoded values
2. **Accessibility**: Ensure sufficient contrast ratios between text and background
3. **Context**: Choose the appropriate intensity level for the context
4. **Dark Mode**: All colors automatically adapt to light/dark themes
5. **Meaning**: Use colors that match their semantic meaning (success = green, error = red)

## 🚀 **Migration Tips**

When updating existing components:

1. **Replace hardcoded colors** with semantic equivalents
2. **Use appropriate intensity levels** (primary, secondary, tertiary)
3. **Consider context** when choosing between status colors
4. **Test in both light and dark modes** to ensure consistency
5. **Validate accessibility** with contrast checkers

This enhanced semantic color system provides a robust foundation for consistent, accessible, and meaningful color usage across your entire application! 🎉 