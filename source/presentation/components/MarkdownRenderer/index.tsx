import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MarkdownDisplay, { MarkdownIt } from "react-native-markdown-display";
import { useToast } from '../../alert/toast';
import { useResponsive } from '../../shared/hooks/useResponsive';
import { useAppTheme } from '../../theme/hooks/useTheme';
import { CodeBlock } from '../CodeBlock';
import { MARKDOWN_IMAGE_FILENAME_MAX_LENGTH } from './constants';
import { createMarkdownRendererStyles } from './MarkdownRenderer.styles';

interface MarkdownRendererProps {
  children: string;
  isAnimating?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  isAnimating = false,
}) => {
  console.log('🔍 MarkdownRenderer: Rendering content:', { 
    contentLength: children?.length, 
    hasDiv: children?.includes('<div'),
    hasDivEnd: children?.includes('</div>'),
    isAnimating,
    contentPreview: children?.substring(0, 100) 
  });
  
  const currentTheme = useAppTheme();
  const { isMobile } = useResponsive();
  const styles = React.useMemo(
    () => createMarkdownRendererStyles(currentTheme, isMobile),
    [currentTheme, isMobile]
  );
  const { showError } = useToast();

  // Track downloading images to show loading state
  const [downloadingMap, setDownloadingMap] = React.useState<Record<string, boolean>>({});

  const saveImageAsync = async (src: string, alt: string) => {
    if (downloadingMap[src]) return; // Already downloading

    setDownloadingMap(prev => ({ ...prev, [src]: true }));

    try {
      const sanitizeFilename = (name: string) =>
        name
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, MARKDOWN_IMAGE_FILENAME_MAX_LENGTH) || "image";
      
      const getExtensionFromDataUrl = (src: string) => {
        const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        if (!match) return "png";
        const mimeType = match[1];
        return mimeType.split("/")[1] || "png";
      };

      const isDataUrl = src.startsWith("data:");
      const extension = isDataUrl ? getExtensionFromDataUrl(src) : "png";
      const filename = `${sanitizeFilename(alt || "image")}.${extension}`;

      if (isDataUrl) {
        // Handle data URLs
        const base64Data = src.split(",")[1];
        if (!base64Data) throw new Error("Invalid data URL");

        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        showError("Image saved successfully");
      } else {
        // Handle regular URLs
        const downloadResult = await FileSystem.downloadAsync(
          src,
          `${FileSystem.documentDirectory}${filename}`
        );
        
        if (downloadResult.status === 200) {
          showError("Image saved successfully");
        } else {
          throw new Error(`Download failed with status: ${downloadResult.status}`);
        }
      }
    } catch (error) {
      showError(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingMap(prev => ({ ...prev, [src]: false }));
    }
  };

  // Use MarkdownIt from react-native-markdown-display to configure parsing
  const md = React.useMemo(
    () =>
      MarkdownIt({
        typographer: true,
        linkify: true,
        breaks: true,
      }),
    []
  );

  const customRules = {
    // Custom table renderer with horizontal scrolling for mobile
    table: (node: any, children: any, parent: any, _mdStyles: any) => {
      if (isMobile) {
        return (
          <ScrollView
            key={node.key}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.scrollContainer}
          >
            <View style={styles.table}>{children}</View>
          </ScrollView>
        );
      }
      return <View style={styles.table}>{children}</View>;
    },

    // Custom table header renderer
    thead: (node: any, children: any, parent: any, _mdStyles: any) => {
      return <View style={styles.thead}>{children}</View>;
    },

    // Custom table body renderer
    tbody: (node: any, children: any, parent: any, _mdStyles: any) => {
      return <View style={styles.tbody}>{children}</View>;
    },

    // Custom table row renderer - this is crucial for proper column separation
    tr: (node: any, children: any, parent: any, _mdStyles: any) => {
      return <View style={styles.tr}>{children}</View>;
    },

    th: (node: any, children: any, parent: any, _mdStyles: any) => {
      return (
        <View style={styles.th}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            style={styles.cellScrollView}
          >
            {children}
          </ScrollView>
        </View>
      );
    },

    // Custom table data cell renderer
    td: (node: any, children: any, parent: any, _mdStyles: any) => {
      return (
        <View style={styles.td}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            style={styles.cellScrollView}
          >
            {children}
          </ScrollView>
        </View>
      );
    },

    // Custom code block renderer using our CodeBlock component
    code_block: (node: any, children: any, parent: any, _mdStyles: any) => {
      const { content } = node;
      const language = node.sourceInfo || "text";

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
      const language = node.sourceInfo || "text";

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
      const src =
        node?.attributes?.src || node?.attributes?.href || node?.content || "";
      const alt = node?.attributes?.alt || node?.content || "image";
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
              <Ionicons name="download-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      );
    },
  };

  const contentToShow = `${children}${isAnimating ? "▍" : ""}`;

  return (
    <MarkdownDisplay
      markdownit={md}
      style={{
        // Main body text
        body: styles.body,
        paragraph: styles.paragraph,
        
        // Typography hierarchy
        heading1: styles.heading1,
        heading2: styles.heading2,
        heading3: styles.heading3,
        heading4: styles.heading4,
        heading5: styles.heading5,
        heading6: styles.heading6,
        
        // Text formatting
        strong: styles.strong,
        em: styles.em,
        
        // Code (fallback styles if custom renderers fail)
        code_block: styles.code_block,
        fence: styles.fence,
        code_inline: styles.code_inline,
        
        // Lists
        bullet_list: styles.bullet_list,
        ordered_list: styles.ordered_list,
        list_item: styles.list_item,
        bullet_list_icon: styles.bullet_list_icon,
        
        // Blockquotes
        blockquote: styles.blockquote,
        
        // Tables
        table: styles.table,
        thead: styles.thead,
        tbody: styles.tbody,
        tr: styles.tr,
        th: styles.th,
        td: styles.td,
        
        // Links
        link: styles.link,
        
        // Horizontal rules
        hr: styles.hr,
        
        // Images
        image: styles.image,
      }}
      rules={customRules}
    >
      {contentToShow}
    </MarkdownDisplay>
  );
};
