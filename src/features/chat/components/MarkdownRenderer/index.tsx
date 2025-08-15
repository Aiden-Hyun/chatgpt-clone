import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import MarkdownDisplay, { MarkdownIt } from 'react-native-markdown-display';
import { useAppTheme } from '../../../theme/theme';
import { CodeBlock } from '../CodeBlock';
import { createMarkdownRendererStyles } from './MarkdownRenderer.styles';
import { useToast } from '../../../alert';

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
  const { showError, showSuccess } = useToast();
  const [downloadingMap, setDownloadingMap] = React.useState<Record<string, boolean>>({});
  const setDownloading = React.useCallback((key: string, value: boolean) => {
    setDownloadingMap(prev => ({ ...prev, [key]: value }));
  }, []);
  const sanitizeFilename = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image';
  const getExtensionFromDataUrl = (src: string) => {
    const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    if (!match) return 'png';
    const mime = match[1];
    const parts = mime.split('/');
    return parts[1] || 'png';
  };
  const saveImageAsync = React.useCallback(async (src: string, alt: string) => {
    const key = src;
    try {
      setDownloading(key, true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        showError('Permission required to save images');
        return;
      }
      let fileUri = '';
      if (src.startsWith('data:')) {
        const ext = getExtensionFromDataUrl(src);
        const base64 = src.split('base64,')[1];
        const filename = `${sanitizeFilename(alt || 'image')}-${Date.now()}.${ext}`;
        fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        const urlExt = (() => {
          try {
            const url = new URL(src);
            const pathname = url.pathname;
            const maybe = pathname.split('.').pop() || '';
            const clean = maybe.split('?')[0].split('#')[0];
            if (clean && clean.length <= 5) return clean;
            return 'png';
          } catch {
            const maybe = src.split('.').pop() || '';
            const clean = maybe.split('?')[0].split('#')[0];
            return clean || 'png';
          }
        })();
        const filename = `${sanitizeFilename(alt || 'image')}-${Date.now()}.${urlExt}`;
        fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.downloadAsync(src, fileUri);
      }
      await MediaLibrary.saveToLibraryAsync(fileUri);
      try { showSuccess('Image saved to Photos'); } catch {}
    } catch {
      try { showError('Failed to save image'); } catch {}
    } finally {
      setDownloading(key, false);
    }
  }, [setDownloading, showError, showSuccess]);
  
  // Use MarkdownIt from react-native-markdown-display to configure parsing
  const md = React.useMemo(
    () =>
      MarkdownIt({
        html: false,
        linkify: true,
        typographer: true,
        breaks: false,
      }),
    []
  );

  // Custom rules for specific markdown elements
  const customRules = {
    // Custom code block renderer using our CodeBlock component
    code_block: (node: any, children: any, parent: any, _mdStyles: any) => {
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
    fence: (node: any, children: any, parent: any, _mdStyles: any) => {
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
    code_inline: (node: any, children: any, parent: any, _mdStyles: any) => {
      return (
        <Text key={node.key} style={styles.code_inline}>
          {node.content}
        </Text>
      );
    },
    
    // Custom image renderer to avoid key spread warnings from default implementation
    image: (node: any, children: any, parent: any, _mdStyles: any) => {
      const src = node?.attributes?.src || node?.attributes?.href || node?.content || '';
      const alt = node?.attributes?.alt || node?.content || 'image';
      if (!src) return null;
      const isDownloading = !!downloadingMap[src];
      return (
        <View key={node.key} style={styles.image_container}>
          <ExpoImage
            source={{ uri: src }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={alt}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Save image"
            style={styles.image_overlayButton}
            onPress={() => saveImageAsync(src, alt)}
            onLongPress={() => saveImageAsync(src, alt)}
            activeOpacity={0.8}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="file-download" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      );
    },
  };

  const contentToShow = `${children}${isAnimating ? '▍' : ''}`;

  return (
    <MarkdownDisplay
      markdownit={md}
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
        image: styles.image,
      }}
      rules={customRules}
    >
      {contentToShow}
    </MarkdownDisplay>
  );
};
