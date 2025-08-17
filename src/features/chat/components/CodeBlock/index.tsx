import { MaterialIcons } from '@expo/vector-icons';
// import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { copy as copyToClipboard } from '../../../../shared/lib/clipboard';
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
  const { showSuccess, showError } = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      try { showSuccess('Copied to clipboard'); } catch {}
    } catch {
      try { showError('Failed to copy'); } catch {}
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
          onPress={handleCopy}
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
                <View key={`line-${idx}-${line.length}-${line.substring(0, 10).replace(/\s/g, '')}`} style={styles.lineContainer}>
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
