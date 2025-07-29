# Context Decision Tree

A quick guide to help you decide when and how to use React Context in your React Native app.

## 🤔 Do you need to share data across components?

### ❌ **No** → Use local state
```tsx
const [data, setData] = useState(initialValue);
```

### ✅ **Yes** → Continue to next question

---

## 🎯 What type of data are you sharing?

### **UI State** (theme, loading, modals)
→ **Use existing shared contexts**
- `useAppTheme()` - Theme and color scheme
- `useColorScheme()` - System theme detection

### **Feature State** (chat, auth, user)
→ **Use feature-specific contexts**
- `AuthContext` - Authentication state
- `ChatContext` - Chat messages and rooms

### **App State** (global settings, navigation)
→ **Create new shared context**
```tsx
const AppContext = createContext();
```

---

## 📍 How many components need this data?

### **2-3 components** → Consider prop drilling first
```tsx
<Parent data={data}>
  <Child data={data} />
</Parent>
```

### **4+ components** → Use Context
```tsx
<DataProvider>
  <AnyDeepComponent />
</DataProvider>
```

---

## 🔄 How often does the data change?

### **Rarely** (theme, user settings)
→ **Use Context with useMemo**
```tsx
const value = useMemo(() => ({ data, setData }), [data]);
```

### **Frequently** (chat messages, form state)
→ **Use Context with useCallback**
```tsx
const setData = useCallback((newData) => {
  // Update logic
}, []);
```

---

## 🏗️ Context Structure Decision

### **Simple data** → Single context
```tsx
const SimpleContext = createContext();
```

### **Complex data** → Split contexts
```tsx
const DataContext = createContext();
const ActionsContext = createContext();
```

---

## ✅ Final Checklist

- [ ] Data is truly shared across components
- [ ] Prop drilling would be cumbersome
- [ ] Context won't cause unnecessary re-renders
- [ ] Context is properly memoized
- [ ] Context has clear boundaries

## 🚫 When NOT to use Context

- Local component state
- Server state (use React Query/SWR)
- Form state (use React Hook Form)
- Temporary UI state
- Data that changes too frequently

## 📚 Quick Examples

### **Theme Context** ✅
```tsx
const theme = useAppTheme();
```

### **Chat Messages** ✅
```tsx
const { messages, sendMessage } = useChat();
```

### **Form State** ❌
```tsx
const [formData, setFormData] = useState({});
``` 