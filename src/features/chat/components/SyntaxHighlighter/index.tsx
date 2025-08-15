import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { useThemeContext } from '../../../theme/ThemeContext';
import { createSyntaxHighlighterStyles } from './SyntaxHighlighter.styles';

 
// @ts-ignore - library lacks proper types for RN env
import SyntaxHighlighter from 'react-native-syntax-highlighter';
 
// @ts-ignore - use Prism styles for richer, IDE-like colorization
import { nightOwl, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SyntaxHighlighterComponentProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export const SyntaxHighlighterComponent: React.FC<SyntaxHighlighterComponentProps> = ({
  code,
  language,
}) => {
  const theme = useAppTheme();
  const { currentTheme } = useThemeContext();
  const styles = React.useMemo(() => createSyntaxHighlighterStyles(theme), [theme]);

  const prismTheme = currentTheme === 'dark' ? nightOwl : oneLight;

  // Use integer pixel values to avoid sub-pixel rounding gaps between rows
  const fontSize = 14;
  const lineHeight = Math.round(fontSize * 1.6);

  const normalizeLanguage = React.useCallback((lang?: string): string | undefined => {
    // Prism does not auto-detect; provide a safe default
    if (!lang) return 'text';
    const l = String(lang).toLowerCase();
    const aliases: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      sh: 'bash',
      shell: 'bash',
      py: 'python',
      rb: 'ruby',
      yml: 'yaml',
      md: 'markdown',
      'c#': 'cs',
      csharp: 'cs',
      objc: 'objectivec',
      'objective-c': 'objectivec',
      plaintext: 'text',
      plain: 'text',
      text: 'text',
    };
    const mapped = aliases[l] ?? l;
    return mapped;
  }, []);

  const normalizedLanguage = normalizeLanguage(language);

  return (
    <View style={styles.container}>
      <SyntaxHighlighter
        language={normalizedLanguage as any}
        style={prismTheme}
        customStyle={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          fontSize,
          lineHeight,
        }}
        highlighter="prism"
        renderer={(rendererProps: any) => <View {...rendererProps} />}
        CodeTag={View}
        PreTag={View}
      >
        {code}
      </SyntaxHighlighter>
    </View>
  );
};
