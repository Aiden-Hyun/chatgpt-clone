// Pure token estimation service - no external dependencies

export class TokenEstimator {
  /**
   * Estimates token count using OpenAI's rough approximation
   * 1 token ≈ 4 characters for English text
   */
  static estimateTokens(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimates tokens for an array of messages
   */
  static estimateMessagesTokens(messages: { content: string }[]): number {
    if (!Array.isArray(messages)) return 0;
    
    return messages.reduce((total, message) => {
      return total + this.estimateTokens(message.content);
    }, 0);
  }

  /**
   * Checks if token count is within limit
   */
  static isWithinLimit(text: string, maxTokens: number): boolean {
    return this.estimateTokens(text) <= maxTokens;
  }

  /**
   * Truncates text to fit within token limit
   */
  static truncateToTokenLimit(text: string, maxTokens: number): string {
    if (!text || typeof text !== 'string') return '';
    
    const estimatedTokens = this.estimateTokens(text);
    if (estimatedTokens <= maxTokens) return text;
    
    // Rough character limit based on token estimation
    const maxChars = maxTokens * 4;
    return text.substring(0, maxChars - 3) + '...';
  }
}
