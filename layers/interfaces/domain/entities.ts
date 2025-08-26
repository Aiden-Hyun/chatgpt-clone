import { ChatMessage, ChatRoom, Language, Theme, User } from './types';

// Domain entities with business logic
export interface ChatSession {
  roomId: number;
  messages: ChatMessage[];
  currentModel: string;
  isSearchMode: boolean;
  
  // Domain methods
  addMessage(message: ChatMessage): void;
  updateMessage(id: string, content: string): void;
  deleteMessage(id: string): void;
  switchModel(model: string): void;
  toggleSearchMode(): void;
  getMessageById(id: string): ChatMessage | undefined;
  getLastMessage(): ChatMessage | undefined;
  clearMessages(): void;
}

export interface UserSession {
  user: User;
  isAuthenticated: boolean;
  permissions: string[];
  
  // Domain methods
  hasPermission(permission: string): boolean;
  canAccessRoom(roomId: number): boolean;
  canModifyMessage(messageId: string): boolean;
  canDeleteRoom(roomId: number): boolean;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  notifications: NotificationSettings;
  
  // Domain methods
  updateTheme(theme: Theme): void;
  updateLanguage(language: Language): void;
  updateNotificationSettings(settings: Partial<NotificationSettings>): void;
  resetToDefaults(): void;
}

export interface ChatRoomSession {
  room: ChatRoom;
  messages: ChatMessage[];
  isActive: boolean;
  lastActivity: Date;
  
  // Domain methods
  addMessage(message: ChatMessage): void;
  updateRoomName(name: string): void;
  switchModel(model: string): void;
  markAsActive(): void;
  isStale(timeoutMinutes: number): boolean;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  vibration: boolean;
}
