/**
 * Markdown-related interfaces for presentation layer
 */

// ============================================================================
// MARKDOWN NODE TYPES - Types for markdown parsing nodes
// ============================================================================

/**
 * Base markdown node interface
 */
export interface MarkdownNode {
  key?: string;
  content?: string;
  attributes?: Record<string, string>;
  sourceInfo?: string;
  [key: string]: unknown;
}

/**
 * Link node interface
 */
export interface LinkNode extends MarkdownNode {
  attributes?: {
    href?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Code block node interface
 */
export interface CodeBlockNode extends MarkdownNode {
  content: string;
  sourceInfo?: string;
}

/**
 * Table node interface
 */
export interface TableNode extends MarkdownNode {
  children?: MarkdownNode[];
}

/**
 * Table header node interface
 */
export interface TableHeaderNode extends MarkdownNode {
  children?: MarkdownNode[];
}

/**
 * Table body node interface
 */
export interface TableBodyNode extends MarkdownNode {
  children?: MarkdownNode[];
}

/**
 * Table row node interface
 */
export interface TableRowNode extends MarkdownNode {
  children?: MarkdownNode[];
}

/**
 * Table cell node interface
 */
export interface TableCellNode extends MarkdownNode {
  children?: MarkdownNode[];
}

// ============================================================================
// MARKDOWN RENDERER TYPES - Types for markdown rendering
// ============================================================================

/**
 * Markdown renderer function signature
 */
export type MarkdownRenderer<T extends MarkdownNode = MarkdownNode> = (
  node: T,
  children: React.ReactNode,
  parent: MarkdownNode | null,
  styles: Record<string, unknown>
) => React.ReactElement | null;

/**
 * Markdown renderer rules object
 */
export interface MarkdownRendererRules {
  link?: MarkdownRenderer<LinkNode>;
  table?: MarkdownRenderer<TableNode>;
  thead?: MarkdownRenderer<TableHeaderNode>;
  tbody?: MarkdownRenderer<TableBodyNode>;
  tr?: MarkdownRenderer<TableRowNode>;
  th?: MarkdownRenderer<TableCellNode>;
  td?: MarkdownRenderer<TableCellNode>;
  code_block?: MarkdownRenderer<CodeBlockNode>;
  fence?: MarkdownRenderer<CodeBlockNode>;
  code_inline?: MarkdownRenderer<MarkdownNode>;
  [key: string]: MarkdownRenderer | undefined;
}

// ============================================================================
// MARKDOWN STYLES TYPES - Types for markdown styling
// ============================================================================

/**
 * Markdown styles interface
 */
export interface MarkdownStyles {
  [key: string]: unknown;
}

/**
 * Media library interface for image saving
 */
export interface MediaLibrary {
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  saveToLibraryAsync(fileUri: string): Promise<void>;
}

// ============================================================================
// MARKDOWN UTILITY TYPES - Types for markdown utilities
// ============================================================================

/**
 * Image download options
 */
export interface ImageDownloadOptions {
  src: string;
  alt?: string;
  key: string;
}

/**
 * File system interface for image operations
 */
export interface FileSystemInterface {
  cacheDirectory: string;
  writeAsStringAsync(
    fileUri: string,
    content: string,
    options: { encoding: 'base64' }
  ): Promise<void>;
  downloadAsync(url: string, fileUri: string): Promise<void>;
  EncodingType: {
    Base64: 'base64';
  };
}
