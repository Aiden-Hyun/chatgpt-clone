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
