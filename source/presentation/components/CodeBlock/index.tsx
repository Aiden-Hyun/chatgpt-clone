import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../alert/toast/ToastContext';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { useTheme } from '../../theme/hooks/useTheme';
import { CodeStyler } from '../CodeStyler';
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
  const currentTheme = useTheme();
  const styles = React.useMemo(() => createCodeBlockStyles(currentTheme), [currentTheme]);
  const { showSuccess, showError } = useToast();
  const { clipboard } = useBusinessContext();

  const handleCopy = async () => {
    try {
      const result = await clipboard.copyToClipboard(code);
      if (result.success) {
        showSuccess('Copied to clipboard');
      } else {
        showError(result.error || 'Failed to copy');
      }
    } catch (error) {
      showError('Failed to copy');
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
          <Ionicons 
            name="copy-outline" 
            size={16} 
            color={currentTheme.colors.text.tertiary} 
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
                    <CodeStyler
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
          <CodeStyler
            code={code}
            language={language || 'text'}
            showLineNumbers={false}
          />
        )}
      </View>
    </View>
  );
};
