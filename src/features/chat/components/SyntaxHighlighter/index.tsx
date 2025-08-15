import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { useThemeContext } from '../../../theme/ThemeContext';
import { createSyntaxHighlighterStyles } from './SyntaxHighlighter.styles';

 
// @ts-ignore - library lacks proper types for RN env
import SyntaxHighlighter from 'react-native-syntax-highlighter';
 
// @ts-ignore - use ESM style bundle for Metro compatibility
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

  const hljsTheme = currentTheme === 'dark' ? atomOneDark : atomOneLight;

  return (
    <View style={styles.container}>
      <SyntaxHighlighter
        language={language || 'text'}
        style={hljsTheme}
        customStyle={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          lineHeight: code.includes('\n') ? 1.6 : 1.2,
          fontSize: 14,
        }}
        highlighter="hljs"
      >
        {code}
      </SyntaxHighlighter>
    </View>
  );
};
