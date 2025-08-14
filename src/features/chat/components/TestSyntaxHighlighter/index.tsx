import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { CodeBlock } from '../CodeBlock';

export const TestSyntaxHighlighter: React.FC = () => {
  const theme = useAppTheme();

  const testCode = `function greetUser(name) {
  // This is a comment
  const greeting = "Hello, " + name + "!";
  const number = 42;
  
  if (name.length > 0) {
    console.log(greeting);
    return true;
  }
  
  return false;
}

// Call the function
greetUser("World");`;

  const pythonCode = `def greet_user(name):
    # This is a comment
    greeting = f"Hello, {name}!"
    number = 42
    
    if len(name) > 0:
        print(greeting)
        return True
    
    return False

# Call the function
greet_user("World")`;

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background.primary }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text.primary }}>
        Syntax Highlighting Test
      </Text>
      
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: theme.colors.text.primary }}>
        JavaScript Code:
      </Text>
      <CodeBlock code={testCode} language="javascript" showLineNumbers={true} />
      
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 24, color: theme.colors.text.primary }}>
        Python Code:
      </Text>
      <CodeBlock code={pythonCode} language="python" showLineNumbers={true} />
      
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 24, color: theme.colors.text.primary }}>
        Plain Text:
      </Text>
      <CodeBlock code="This is plain text without highlighting" language="text" showLineNumbers={false} />
    </ScrollView>
  );
};
