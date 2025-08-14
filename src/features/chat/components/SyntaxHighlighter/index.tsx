import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { useThemeContext } from '../../../theme/ThemeContext';
import { createSyntaxHighlighterStyles } from './SyntaxHighlighter.styles';

interface SyntaxHighlighterComponentProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

// Simple but effective syntax highlighter for React Native
export const SyntaxHighlighterComponent: React.FC<SyntaxHighlighterComponentProps> = ({
  code,
  language,
  showLineNumbers = false,
}) => {
  const theme = useAppTheme();
  const { currentTheme } = useThemeContext();
  const styles = React.useMemo(() => createSyntaxHighlighterStyles(theme), [theme]);
  
  // Simple syntax highlighting using regex patterns
  const highlightCode = (code: string, lang: string) => {
    const lines = code.split('\n');
    
    return lines.map((line, lineIndex) => {
      const tokens = tokenizeLine(line, lang);
      
      return (
        <View key={lineIndex} style={{ flexDirection: 'row', minHeight: 22 }}>
          {showLineNumbers && (
            <Text style={{
              color: theme.colors.text.quaternary,
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              textAlign: 'right',
              minWidth: 30,
              paddingRight: 12,
              opacity: 0.7,
            }}>
              {(lineIndex + 1).toString().padStart(2, ' ')}
            </Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              lineHeight: 22,
            }}>
              {tokens.map((token, tokenIndex) => (
                <Text key={tokenIndex} style={getTokenStyle(token.type, theme)}>
                  {token.value}
                </Text>
              ))}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {highlightCode(code, language)}
    </View>
  );
};

// Token types for syntax highlighting
type TokenType = 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'operator' | 'default';

interface Token {
  type: TokenType;
  value: string;
}

// Get style for each token type
const getTokenStyle = (type: TokenType, theme: any) => {
  const styles = {
    keyword: { color: theme.colors.syntax.keyword, fontWeight: '600' },
    string: { color: theme.colors.syntax.string },
    comment: { color: theme.colors.syntax.comment, fontStyle: 'italic' },
    number: { color: theme.colors.syntax.number },
    function: { color: theme.colors.syntax.function, fontWeight: '500' },
    operator: { color: theme.colors.syntax.operator },
    default: { color: theme.colors.text.primary },
  };
  
  return styles[type] || styles.default;
};

// Simple tokenizer for basic syntax highlighting
const tokenizeLine = (line: string, language: string): Token[] => {
  const tokens: Token[] = [];
  
  // Language-specific keywords
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'new', 'this'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'interface', 'type', 'async', 'await', 'try', 'catch', 'new', 'this'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'and', 'or', 'not', 'in'],
    java: ['public', 'private', 'class', 'interface', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'static', 'final', 'new', 'this'],
  };
  
  const langKeywords = keywords[language] || [];
  
  // Split by meaningful separators but keep them
  const parts = line.split(/(\s+|[(){}\[\];,.]|\/\/|\/\*|\*\/|"[^"]*"|'[^']*'|`[^`]*`|\d+\.?\d*)/);
  
  for (const part of parts) {
    if (!part) continue;
    
    // Check token type
    if (part.match(/^\s+$/)) {
      // Whitespace
      tokens.push({ type: 'default', value: part });
    } else if (part.startsWith('//') || part.startsWith('#') || part.startsWith('/*') || part.startsWith('*')) {
      // Comments
      tokens.push({ type: 'comment', value: part });
    } else if (part.match(/^["'`].*["'`]$/)) {
      // Strings
      tokens.push({ type: 'string', value: part });
    } else if (part.match(/^\d+\.?\d*$/)) {
      // Numbers
      tokens.push({ type: 'number', value: part });
    } else if (langKeywords.includes(part)) {
      // Keywords
      tokens.push({ type: 'keyword', value: part });
    } else if (part.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && tokens.length > 0 && tokens[tokens.length - 1].value.trim() === '') {
      // Potential function names (simplified detection)
      tokens.push({ type: 'function', value: part });
    } else if (part.match(/[+\-*/%=<>!&|^~]/)) {
      // Operators
      tokens.push({ type: 'operator', value: part });
    } else {
      // Default
      tokens.push({ type: 'default', value: part });
    }
  }
  
  return tokens;
};
