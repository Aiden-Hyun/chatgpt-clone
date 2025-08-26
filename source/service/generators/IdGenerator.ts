export class IdGenerator {
  static generateUserId(): string {
    return `user_${this.generateRandomString(16)}`;
  }

  static generateSessionId(): string {
    return `session_${this.generateRandomString(24)}`;
  }

  static generateToken(): string {
    return this.generateRandomString(32);
  }

  static generateVerificationCode(): string {
    return this.generateRandomString(6, '0123456789');
  }

  static generatePasswordResetToken(): string {
    return this.generateRandomString(64);
  }

  static generateChatRoomId(): string {
    return `room_${this.generateRandomString(12)}`;
  }

  static generateMessageId(): string {
    return `msg_${this.generateRandomString(16)}`;
  }

  private static generateRandomString(length: number, charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    const charactersLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateShortId(): string {
    return this.generateRandomString(8);
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  }
}
