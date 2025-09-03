
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Image as ExpoImage } from "expo-image";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MarkdownDisplay, {
  ASTNode,
  MarkdownIt,
} from "react-native-markdown-display";

import { useResponsive } from "../../../../shared/hooks/useResponsive";
import { useToast } from "../../../alert";
import { useAppTheme } from "../../../theme/theme";
import {
  MARKDOWN_IMAGE_FILENAME_MAX_LENGTH,
  SHORT_CODE_SNIPPET_THRESHOLD,
} from "../../constants";
import { CodeBlock } from "../CodeBlock";

import { createMarkdownRendererStyles } from "./MarkdownRenderer.styles";

interface MarkdownRendererProps {
  children: string;
  isAnimating?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  children,
  isAnimating = false,
}) => {
  const theme = useAppTheme();
  const { isMobile } = useResponsive();
  const styles = React.useMemo(
    () => createMarkdownRendererStyles(theme, isMobile),
    [theme, isMobile]
  );
  const { showError, showSuccess } = useToast();
  const [downloadingMap, setDownloadingMap] = React.useState<
    Record<string, boolean>
  >({});
  const setDownloading = React.useCallback((key: string, value: boolean) => {
    setDownloadingMap((prev) => ({ ...prev, [key]: value }));
  }, []);
  const sanitizeFilename = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MARKDOWN_IMAGE_FILENAME_MAX_LENGTH) || "image";
  const getExtensionFromDataUrl = (src: string) => {
    const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
    if (!match) return "png";
    const mime = match[1];
    const parts = mime.split("/");
    return parts[1] || "png";
  };
  const saveImageAsync = React.useCallback(
    async (src: string, alt: string) => {
      const key = src;
      try {
        setDownloading(key, true);
        if (Platform.OS === "web") {
          try {
            showError("Saving to Photos is only supported on iOS/Android");
          } catch {}
          return;
        }

        let MediaLibrary: typeof import("expo-media-library");
        try {
          MediaLibrary = await import("expo-media-library");
        } catch {
          try {
            showError(
              "Media Library not available. Rebuild the native app to include expo-media-library."
            );
          } catch {}
          return;
        }

        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) {
          showError("Permission required to save images");
          return;
        }
        let fileUri = "";
        if (src.startsWith("data:")) {
          const ext = getExtensionFromDataUrl(src);
          const base64 = src.split("base64,")[1];
          const filename = `${sanitizeFilename(
            alt || "image"
          )}-${Date.now()}.${ext}`;
          fileUri = `${FileSystem.cacheDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          const urlExt = (() => {
            try {
              const url = new URL(src);
              const pathname = url.pathname;
              const maybe = pathname.split(".").pop() || "";
              const clean = maybe.split("?")[0].split("#")[0];
              if (clean && clean.length <= SHORT_CODE_SNIPPET_THRESHOLD)
                return clean;
              return "png";
            } catch {
              const maybe = src.split(".").pop() || "";
              const clean = maybe.split("?")[0].split("#")[0];
              return clean || "png";
            }
          })();
          const filename = `${sanitizeFilename(
            alt || "image"
          )}-${Date.now()}.${urlExt}`;
          fileUri = `${FileSystem.cacheDirectory}${filename}`;
          await FileSystem.downloadAsync(src, fileUri);
        }
        await MediaLibrary.saveToLibraryAsync(fileUri);
        try {
          showSuccess("Image saved to Photos");
        } catch {}
      } catch {
        try {
          showError("Failed to save image");
        } catch {}
      } finally {
        setDownloading(key, false);
      }
    },
    [setDownloading, showError, showSuccess]
  );

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
    // inside customRules
    // link: (node: any, children: any, parent: any, _mdStyles: any) => {
    //   const href = node?.attributes?.href || node?.content || "";

    //   const handlePress = async () => {
    //     try {
    //       const supported = await Linking.canOpenURL(href);
    //       if (supported) await Linking.openURL(href);
    //       else showError(`Cannot open URL: ${href}`);
    //     } catch (error) {
    //       showError("Failed to open link " + error);
    //     }
    //   };

    //   // IMPORTANT: apply styles here
    //   return (
    //     <Text
    //       key={node.key}
    //       style={[_mdStyles.text, _mdStyles.link]} // _mdStyles.link LAST so it can override
    //       onPress={handlePress}
    //       suppressHighlighting
    //     >
    //       {children}
    //     </Text>
    //   );
    // },

    // text: (node: any, _children: any, parent: any, _mdStyles: any) => {
    //   const isInLink =
    //     parent?.type === 'link' ||
    //     parent?.type === 'link_open' || // safety for token variations
    //     parent?.type === 'a';

    //   return (
    //     <Text
    //       key={node.key}
    //       style={isInLink ? [_mdStyles.text, _mdStyles.link] : _mdStyles.text}
    //     >
    //       {node.content}
    //     </Text>
    //   );
    // },

    // Custom table renderer with horizontal scroll on mobile
    table: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      if (isMobile) {
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: theme.spacing.lg }}
          >
            <View style={styles.table}>{children}</View>
          </ScrollView>
        );
      }
      return <View style={styles.table}>{children}</View>;
    },

    // Custom table header renderer
    thead: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return <View style={styles.thead}>{children}</View>;
    },

    // Custom table body renderer
    tbody: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return <View style={styles.tbody}>{children}</View>;
    },

    // Custom table row renderer - this is crucial for proper column separation
    tr: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return <View style={styles.tr}>{children}</View>;
    },

    th: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return (
        <View style={styles.th}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            //indicatorStyle={styles.scrollBar}
            style={styles.cellScrollView}
          >
            {children}
          </ScrollView>
        </View>
      );
    },

    // Custom table data cell renderer
    td: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return (
        <View style={styles.td}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={true}
            //indicatorStyle={styles.scrollBar}
            style={styles.cellScrollView}
          >
            {children}
          </ScrollView>
        </View>
      );
    },

    // Custom code block renderer using our CodeBlock component
    code_block: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
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
    fence: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
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
    code_inline: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
      return (
        <Text key={node.key} style={styles.code_inline}>
          {node.content}
        </Text>
      );
    },

    // Custom image renderer to avoid key spread warnings from default implementation
    image: (
      node: ASTNode,
      children: ReactNode[],
      parent: ASTNode[],
      _mdStyles: Record<string, unknown>
    ) => {
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

        // Text styling
        strong: styles.strong,
        em: styles.em,

        // Inline code (for fallback)
        //code_inline: styles.code_inline,

        // Lists
        bullet_list: styles.bullet_list,
        ordered_list: styles.ordered_list,
        list_item: styles.list_item,
        bullet_list_icon: styles.bullet_list_icon,

        // Other elements
        blockquote: styles.blockquote,
        // Table styles handled by custom rule
        link: styles.link,
        //text: styles.text,
        hr: styles.hr,
        image: styles.image,
      }}
      rules={customRules}
    >
      {contentToShow}
    </MarkdownDisplay>
  );
};
