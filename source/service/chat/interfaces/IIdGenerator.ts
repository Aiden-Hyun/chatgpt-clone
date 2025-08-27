// Service layer interface for ID generation
export interface IIdGenerator {
  generateMessageId(): string;
  generateRoomId(): string;
  generateUserId(): string;
  generateSessionId(): string;
}
