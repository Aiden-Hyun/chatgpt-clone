import { MaterialIcons } from '@expo/vector-icons';
// import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../../alert';
import { useAppTheme } from '../../../theme/theme';
import { SyntaxHighlighterComponent } from '../SyntaxHighlighter';
import { createCodeBlockStyles } from './CodeBlock.styles';

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
  const { showSuccess } = useToast();

  const copyToClipboard = async () => {
    try {
      // Use the same pattern as the existing app for clipboard
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        // Clipboard.setStringAsync(code); // Commented out as per edit hint
      }
      Alert.alert('Copied!', 'Code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const lines = React.useMemo(() => code.split('\n'), [code]);

  return (
    <View style={styles.container}>
      {/* Header with language and copy button */}
      <View style={styles.header}>
        <Text style={styles.languageLabel}>
          {language.toUpperCase()}
        </Text>
        <TouchableOpacity 
          style={styles.copyButton}
          onPress={() => {
            // Clipboard.setStringAsync(String(children));
            showSuccess('Copy functionality disabled.');
          }}
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
        {showLineNumbers ? (
          <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
            <View>
              {lines.map((line, idx) => (
                <View key={idx} style={styles.lineContainer}>
                  <Text style={styles.lineNumber} allowFontScaling={false}>
                    {(idx + 1).toString()}
                  </Text>
                  <View style={styles.codeContent}>
                    <SyntaxHighlighterComponent
                      code={line && line.length > 0 ? line : ' '}
                      language={language || 'text'}
                      showLineNumbers={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <SyntaxHighlighterComponent
            code={code}
            language={language || 'text'}
            showLineNumbers={false}
          />
        )}
      </View>
    </View>
  );
};
