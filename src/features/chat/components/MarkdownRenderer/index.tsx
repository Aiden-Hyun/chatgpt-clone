import React from 'react';
import { Text } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { useAppTheme } from '../../../theme/theme';
import { CodeBlock } from '../CodeBlock';
import { createMarkdownRendererStyles } from './MarkdownRenderer.styles';

interface MarkdownRendererProps {
  children: string;
  isAnimating?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  children, 
  isAnimating = false 
}) => {
  const theme = useAppTheme();
  const styles = React.useMemo(() => createMarkdownRendererStyles(theme), [theme]);

  // Custom rules for specific markdown elements
  const customRules = {
    // Custom code block renderer using our CodeBlock component
    code_block: (node: any, children: any, parent: any, styles: any) => {
      const { content } = node;
      const language = node.sourceInfo || 'text';
      
      return (
        <CodeBlock 
          key={node.key}
          code={content}
          language={language}
          showLineNumbers={false}
        />
      );
    },
    
    // Custom fence renderer (```code``` blocks)
    fence: (node: any, children: any, parent: any, styles: any) => {
      const { content } = node;
      const language = node.sourceInfo || 'text';
      
      return (
        <CodeBlock 
          key={node.key}
          code={content}
          language={language}
          showLineNumbers={true}
        />
      );
    },
    
    // Custom inline code renderer - simple styled text
    code_inline: (node: any, children: any, parent: any, styles: any) => {
      return (
        <Text key={node.key} style={styles.code_inline}>
          {node.content}
        </Text>
      );
    },
  };

  const contentToShow = `${children}${isAnimating ? '▍' : ''}`;

  return (
    <MarkdownDisplay
      style={{
        // Main body text
        body: styles.body,
        text: styles.text,
        paragraph: styles.paragraph,
        
        // Typography hierarchy
        heading1: styles.heading1,
        heading2: styles.heading2,
        heading3: styles.heading3,
        heading4: styles.heading4,
        heading5: styles.heading5,
        heading6: styles.heading6,
        
        // Text styling
        strong: styles.strong,
        em: styles.em,
        
        // Inline code (for fallback)
        code_inline: styles.code_inline,
        
        // Lists
        bullet_list: styles.bullet_list,
        ordered_list: styles.ordered_list,
        list_item: styles.list_item,
        bullet_list_icon: styles.bullet_list_icon,
        
        // Other elements
        blockquote: styles.blockquote,
        table: styles.table,
        thead: styles.thead,
        tbody: styles.tbody,
        th: styles.th,
        td: styles.td,
        link: styles.link,
        hr: styles.hr,
      }}
      rules={customRules}
    >
      {contentToShow}
    </MarkdownDisplay>
  );
};
