export class MessageFormatter {
  /**
   * Format message content for display
   */
  static formatForDisplay(content: string): string {
    // Remove excessive whitespace
    let formatted = content.trim();
    
    // Replace multiple spaces with single space
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Replace multiple newlines with double newline
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return formatted;
  }

  /**
   * Truncate message content for preview
   */
  static truncateForPreview(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }

  /**
   * Extract code blocks from message content
   */
  static extractCodeBlocks(content: string): { language: string; code: string }[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  /**
   * Extract URLs from message content
   */
  static extractUrls(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return content.match(urlRegex) || [];
  }

  /**
   * Count words in message content
   */
  static countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count characters in message content
   */
  static countCharacters(content: string): number {
    return content.length;
  }

  /**
   * Estimate reading time for message content
   */
  static estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = this.countWords(content);
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Sanitize message content for safe display
   */
  static sanitizeForDisplay(content: string): string {
    // Basic HTML escaping
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Format message for export
   */
  static formatForExport(content: string, role: string, timestamp: Date): string {
    const formattedTimestamp = timestamp.toISOString();
    const formattedContent = this.formatForDisplay(content);
    
    return `[${formattedTimestamp}] ${role.toUpperCase()}: ${formattedContent}`;
  }
}
