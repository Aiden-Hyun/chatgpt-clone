export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class MessageValidator {
  private readonly MAX_CONTENT_LENGTH = 10000; // 10KB
  private readonly MIN_CONTENT_LENGTH = 1;
  private readonly FORBIDDEN_WORDS = ['spam', 'hack', 'exploit']; // Example forbidden words

  validateContent(content: string): ValidationResult {
    // Check if content is empty
    if (!content || content.trim().length === 0) {
      return {
        isValid: false,
        error: 'Message content cannot be empty'
      };
    }

    // Check minimum length
    if (content.trim().length < this.MIN_CONTENT_LENGTH) {
      return {
        isValid: false,
        error: 'Message content is too short'
      };
    }

    // Check maximum length
    if (content.length > this.MAX_CONTENT_LENGTH) {
      return {
        isValid: false,
        error: `Message content is too long. Maximum ${this.MAX_CONTENT_LENGTH} characters allowed`
      };
    }

    // Check for forbidden words
    const lowerContent = content.toLowerCase();
    for (const word of this.FORBIDDEN_WORDS) {
      if (lowerContent.includes(word)) {
        return {
          isValid: false,
          error: 'Message contains inappropriate content'
        };
      }
    }

    // Check for excessive whitespace
    if (content.trim().length === 0) {
      return {
        isValid: false,
        error: 'Message content cannot be only whitespace'
      };
    }

    // Check for excessive newlines (spam prevention)
    const newlineCount = (content.match(/\n/g) || []).length;
    if (newlineCount > 50) {
      return {
        isValid: false,
        error: 'Message contains too many line breaks'
      };
    }

    return {
      isValid: true
    };
  }

  validateMessageId(messageId: string): ValidationResult {
    if (!messageId || messageId.trim().length === 0) {
      return {
        isValid: false,
        error: 'Message ID cannot be empty'
      };
    }

    // Check if message ID follows expected format (alphanumeric with hyphens)
    const messageIdPattern = /^[a-zA-Z0-9-]+$/;
    if (!messageIdPattern.test(messageId)) {
      return {
        isValid: false,
        error: 'Invalid message ID format'
      };
    }

    return {
      isValid: true
    };
  }

  validateRoomId(roomId: string): ValidationResult {
    if (!roomId || roomId.trim().length === 0) {
      return {
        isValid: false,
        error: 'Room ID cannot be empty'
      };
    }

    // Check if room ID follows expected format (alphanumeric with hyphens)
    const roomIdPattern = /^[a-zA-Z0-9-]+$/;
    if (!roomIdPattern.test(roomId)) {
      return {
        isValid: false,
        error: 'Invalid room ID format'
      };
    }

    return {
      isValid: true
    };
  }

  validateUserId(userId: string): ValidationResult {
    if (!userId || userId.trim().length === 0) {
      return {
        isValid: false,
        error: 'User ID cannot be empty'
      };
    }

    // Check if user ID follows expected format (alphanumeric with hyphens)
    const userIdPattern = /^[a-zA-Z0-9-]+$/;
    if (!userIdPattern.test(userId)) {
      return {
        isValid: false,
        error: 'Invalid user ID format'
      };
    }

    return {
      isValid: true
    };
  }

  sanitizeContent(content: string): string {
    // Remove excessive whitespace
    let sanitized = content.trim();
    
    // Replace multiple spaces with single space
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Replace multiple newlines with double newline
    sanitized = sanitized.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return sanitized;
  }
}
