# Styling Decision Tree

A quick guide to help you decide when and how to style components in your React Native app.

## 🤔 What are you styling?

### **Text Elements**
→ **Use ThemedText with theme styles**
```tsx
<ThemedText type="title">Title</ThemedText>
<ThemedText style={{ color: theme.colors.text.secondary }}>
  Secondary text
</ThemedText>
```

### **Containers/Layouts**
→ **Use ThemedView with StyleSheet**
```tsx
<ThemedView style={styles.container}>
  <YourContent />
</ThemedView>
```

### **Interactive Elements**
→ **Use themed components + custom styles**
```tsx
<ThemedButton 
  title="Action" 
  style={styles.customButton}
  variant="primary" 
/>
```

### **Custom UI** → Continue to next question

---

## 🎨 What styling approach should you use?

### **Theme-based styling**
→ **Use themed components + theme hook**
```tsx
const theme = useAppTheme();
<ThemedView style={{ backgroundColor: theme.colors.background.primary }}>
  <ThemedText style={{ color: theme.colors.text.primary }}>
    Content
  </ThemedText>
</ThemedView>
```

### **Custom styling**
→ **Use StyleSheet + themed components**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

<ThemedView style={styles.container}>
  <ThemedText>Content</ThemedText>
</ThemedView>
```

### **Dynamic styling**
→ **Use StyleSheet + conditional styles**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  active: {
    backgroundColor: theme.colors.primary,
  },
  inactive: {
    backgroundColor: theme.colors.background.secondary,
  },
});

<ThemedView style={[styles.container, isActive ? styles.active : styles.inactive]}>
  <ThemedText>Content</ThemedText>
</ThemedView>
```

---

## 📱 Is this responsive design?

### **No** → Use fixed dimensions
```tsx
const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 200,
    padding: 16,
  },
});
```

### **Yes** → Use responsive utilities
```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    maxWidth: 400,
    padding: width > 768 ? 24 : 16,
  },
});
```

### **Complex responsive** → Use custom hooks
```tsx
const useResponsive = () => {
  const { width } = useWindowDimensions();
  return {
    isTablet: width > 768,
    isLarge: width > 1024,
    padding: width > 768 ? 24 : 16,
  };
};

const { padding, isTablet } = useResponsive();
<ThemedView style={{ padding, flexDirection: isTablet ? 'row' : 'column' }}>
```

---

## 🖥️ Is this platform-specific?

### **No** → Use cross-platform styles
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
```

### **Yes** → Use Platform.select()
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

### **Complex platform differences** → Use separate style files
```tsx
// styles.ios.ts
export const iosStyles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

// styles.android.ts
export const androidStyles = StyleSheet.create({
  container: {
    elevation: 3,
  },
});

// Usage
const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      ios: iosStyles.container,
      android: androidStyles.container,
    }),
  },
});
```

---

## 🎯 When to use StyleSheet vs inline styles?

### **Use StyleSheet when:**
- Static styles
- Reusable styles
- Performance-critical components
- Complex style objects
- Multiple style properties

```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### **Use inline styles when:**
- Dynamic values from props
- Simple one-off styles
- Theme-based colors
- Quick prototypes

```tsx
<ThemedView style={{ 
  padding: dynamicPadding, 
  backgroundColor: theme.colors.background.primary 
}}>
  <ThemedText style={{ color: theme.colors.text.primary }}>
    Content
  </ThemedText>
</ThemedView>
```

---

## 🎨 Theme vs Custom Styling Decision

### **Use theme styling when:**
- Colors and spacing
- Typography
- Consistent design elements
- Dark/light mode support

```tsx
const theme = useAppTheme();
<ThemedView style={{ 
  backgroundColor: theme.colors.background.primary,
  padding: theme.spacing.medium 
}}>
  <ThemedText style={{ 
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.medium 
  }}>
    Content
  </ThemedText>
</ThemedView>
```

### **Use custom styling when:**
- Unique component designs
- Complex layouts
- Platform-specific features
- One-off visual elements

```tsx
const styles = StyleSheet.create({
  customCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
});
```

---

## ✅ Final Checklist

- [ ] Uses themed components when possible
- [ ] Uses StyleSheet for complex styles
- [ ] Handles responsive design appropriately
- [ ] Considers platform differences
- [ ] Follows design system guidelines
- [ ] Optimized for performance

## 🚫 Styling Anti-patterns

### **Don't use inline styles for:**
- Complex style objects
- Reusable styles
- Performance-critical components
- Multiple style properties

### **Don't hardcode:**
- Colors (use theme)
- Spacing (use theme)
- Font sizes (use theme)
- Platform-specific values (use Platform.select)

### **Don't mix:**
- StyleSheet and inline styles unnecessarily
- Theme and hardcoded values
- Platform-specific code without Platform.select

## 📚 Quick Examples

### **Theme-based Card** ✅
```tsx
const theme = useAppTheme();
<ThemedView style={{
  backgroundColor: theme.colors.background.secondary,
  padding: theme.spacing.medium,
  borderRadius: theme.borderRadius.medium,
}}>
  <ThemedText style={{ color: theme.colors.text.primary }}>
    Card content
  </ThemedText>
</ThemedView>
```

### **Custom Styled Button** ✅
```tsx
const styles = StyleSheet.create({
  customButton: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

<ThemedButton 
  title="Custom Button" 
  style={styles.customButton}
  variant="primary" 
/>
```

### **Responsive Layout** ✅
```tsx
const { width } = useWindowDimensions();
const isTablet = width > 768;

<ThemedView style={{
  flexDirection: isTablet ? 'row' : 'column',
  padding: isTablet ? 24 : 16,
  gap: isTablet ? 16 : 8,
}}>
  <ThemedText>Responsive content</ThemedText>
</ThemedView>
```

### **Platform-specific Shadow** ✅
```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
``` 