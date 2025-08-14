import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../../theme/theme';
import { createCodeBlockStyles } from './CodeBlock.styles';
import { SyntaxHighlighterComponent } from '../SyntaxHighlighter';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'text',
  showLineNumbers = false 
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createCodeBlockStyles(theme), [theme]);

  const copyToClipboard = async () => {
    try {
      // Use the same pattern as the existing app for clipboard
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        await Clipboard.setStringAsync(code);
      }
      Alert.alert('Copied!', 'Code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const lines = code.split('\n');

  return (
    <View style={styles.container}>
      {/* Header with language and copy button */}
      <View style={styles.header}>
        <Text style={styles.languageLabel}>
          {language.toUpperCase()}
        </Text>
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={copyToClipboard}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="content-copy" 
            size={16} 
            color={theme.colors.text.tertiary} 
          />
          <Text style={styles.copyText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {/* Code content */}
      <View style={styles.codeContainer}>
        <SyntaxHighlighterComponent
          code={code}
          language={language || 'text'}
          showLineNumbers={showLineNumbers}
        />
      </View>
    </View>
  );
};
