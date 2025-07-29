# Component Decision Tree

A quick guide to help you decide when and how to create or use components in your React Native app.

## 🤔 Do you need to display UI elements?

### ❌ **No** → Use hooks or utilities
```tsx
const useData = () => { /* logic */ };
const formatDate = (date) => { /* utility */ };
```

### ✅ **Yes** → Continue to next question

---

## 🎯 What type of UI element are you building?

### **Text Display**
→ **Use ThemedText**
```tsx
<ThemedText type="title">Title</ThemedText>
<ThemedText>Regular text</ThemedText>
```

### **Container/Layout**
→ **Use ThemedView**
```tsx
<ThemedView style={styles.container}>
  <YourContent />
</ThemedView>
```

### **Interactive Button**
→ **Use ThemedButton**
```tsx
<ThemedButton 
  title="Action" 
  onPress={handlePress} 
  variant="primary" 
/>
```

### **Loading State**
→ **Use LoadingScreen or LoadingWrapper**
```tsx
<LoadingScreen message="Loading..." />
<LoadingWrapper loading={isLoading}>
  <Content />
</LoadingWrapper>
```

### **Empty State**
→ **Use EmptyState**
```tsx
<EmptyState 
  title="No data" 
  message="Create your first item" 
/>
```

### **Status Indicator**
→ **Use StatusBadge**
```tsx
<StatusBadge status="success" text="Connected" />
```

### **Custom UI** → Continue to next question

---

## 📍 How reusable is this component?

### **One-time use** → Inline JSX
```tsx
<View style={styles.oneOff}>
  <Text>Specific content</Text>
</View>
```

### **Used in 2-3 places** → Consider inline first
```tsx
// Reuse existing components
<ThemedView>
  <ThemedText>Reusable content</ThemedText>
</ThemedView>
```

### **Used in 4+ places** → Create new component
```tsx
const ReusableComponent = ({ data }) => (
  <ThemedView>
    <ThemedText>{data}</ThemedText>
  </ThemedView>
);
```

---

## 🏗️ Where should the component live?

### **Shared across features**
→ **`src/shared/components/`**
```tsx
// src/shared/components/CustomCard/index.tsx
export const CustomCard = ({ title, content }) => (
  <ThemedView style={styles.card}>
    <ThemedText type="subtitle">{title}</ThemedText>
    <ThemedText>{content}</ThemedText>
  </ThemedView>
);
```

### **Feature-specific**
→ **`src/features/[feature]/components/`**
```tsx
// src/features/chat/components/ChatBubble/index.tsx
export const ChatBubble = ({ message }) => (
  <ThemedView style={styles.bubble}>
    <ThemedText>{message}</ThemedText>
  </ThemedView>
);
```

### **Screen-specific**
→ **Inline or local component**
```tsx
const ScreenComponent = () => {
  const LocalComponent = () => <ThemedText>Local use</ThemedText>;
  
  return (
    <ThemedView>
      <LocalComponent />
    </ThemedView>
  );
};
```

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
  },
});

<ThemedView style={styles.container}>
  <ThemedText>Content</ThemedText>
</ThemedView>
```

### **Inline styling**
→ **Avoid - use StyleSheet instead**
```tsx
// ❌ Bad
<View style={{ padding: 16, backgroundColor: '#fff' }}>

// ✅ Good
<ThemedView style={styles.container}>
```

---

## 📦 Component Structure Decision

### **Simple component** → Single file
```tsx
// CustomComponent.tsx
export const CustomComponent = ({ prop }) => (
  <ThemedView>
    <ThemedText>{prop}</ThemedText>
  </ThemedView>
);
```

### **Complex component** → Folder structure
```
CustomComponent/
├── index.tsx
├── CustomComponent.styles.ts
├── CustomComponent.test.tsx
└── CustomComponent.types.ts
```

---

## ✅ Final Checklist

- [ ] Component is truly reusable
- [ ] Uses themed components when possible
- [ ] Has proper TypeScript types
- [ ] Follows naming conventions (PascalCase)
- [ ] Has clear, single responsibility
- [ ] Is properly exported

## 🚫 When NOT to create a component

- One-time use UI
- Simple layout containers
- Logic-only functions
- Utility functions
- Over-abstraction of simple elements

## 📚 Quick Examples

### **Reusable Card** ✅
```tsx
const Card = ({ title, content }) => (
  <ThemedView style={styles.card}>
    <ThemedText type="subtitle">{title}</ThemedText>
    <ThemedText>{content}</ThemedText>
  </ThemedView>
);
```

### **Feature-specific Chat Bubble** ✅
```tsx
const ChatBubble = ({ message, isUser }) => (
  <ThemedView style={[styles.bubble, isUser && styles.userBubble]}>
    <ThemedText>{message}</ThemedText>
  </ThemedView>
);
```

### **One-time Layout** ❌
```tsx
// Don't create a component for this
<ThemedView style={styles.specificLayout}>
  <ThemedText>Specific content</ThemedText>
</ThemedView>
``` 