import { AIModel, ChatMessage, ChatRoom, Language, SearchResult, Theme, User } from '../domain/types';
import { AuthenticationResult, SendMessageRequest, SendMessageResponse, UserCredentials } from './use-cases';

// Application service interfaces
export interface AuthenticationService {
  getCurrentUser(): Promise<User | null>;
  signIn(credentials: UserCredentials): Promise<AuthenticationResult>;
  signUp(userData: UserRegistrationData): Promise<AuthenticationResult>;
  signOut(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  refreshSession(): Promise<AuthenticationResult>;
  resetPassword(email: string): Promise<void>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<AuthenticationResult>;
}

export interface ChatService {
  sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
  loadHistory(roomId: number): Promise<ChatMessage[]>;
  createRoom(name: string, model: string): Promise<ChatRoom>;
  deleteRoom(roomId: number): Promise<void>;
  regenerateMessage(messageId: string, roomId: number, model: string): Promise<SendMessageResponse>;
  searchMessages(roomId: number, query: string): Promise<ChatMessage[]>;
  updateMessage(messageId: string, content: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
}

export interface ThemeService {
  getCurrentTheme(): Promise<Theme>;
  setTheme(themeId: string): Promise<void>;
  getAvailableThemes(): Promise<Theme[]>;
  createCustomTheme(theme: Partial<Theme>): Promise<Theme>;
  updateTheme(themeId: string, updates: Partial<Theme>): Promise<void>;
  deleteTheme(themeId: string): Promise<void>;
  resetToDefault(): Promise<void>;
}

export interface LanguageService {
  getCurrentLanguage(): Promise<Language>;
  setLanguage(languageCode: string): Promise<void>;
  getAvailableLanguages(): Promise<Language[]>;
  addLanguage(language: Language): Promise<void>;
  removeLanguage(languageCode: string): Promise<void>;
  resetToDefault(): Promise<void>;
}

export interface UserService {
  getCurrentUser(): Promise<User | null>;
  updateProfile(updates: Partial<User>): Promise<User>;
  updateAvatar(avatarUrl: string): Promise<void>;
  deleteAccount(): Promise<void>;
  exportUserData(): Promise<UserDataExport>;
  importUserData(data: UserDataExport): Promise<void>;
}

export interface NotificationService {
  getSettings(): Promise<NotificationSettings>;
  updateSettings(settings: Partial<NotificationSettings>): Promise<void>;
  sendNotification(notification: Notification): Promise<void>;
  subscribeToNotifications(): Promise<void>;
  unsubscribeFromNotifications(): Promise<void>;
}

export interface SearchService {
  searchWeb(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchImages(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchDocuments(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  getSearchHistory(): Promise<SearchQuery[]>;
  clearSearchHistory(): Promise<void>;
}

export interface AIModelService {
  getAvailableModels(): Promise<AIModel[]>;
  getModelInfo(modelId: string): Promise<AIModel | null>;
  validateModel(modelId: string): Promise<boolean>;
  getModelCapabilities(modelId: string): Promise<ModelCapabilities>;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getKeys(pattern?: string): Promise<string[]>;
}

export interface LoggingService {
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  trace(message: string, context?: Record<string, any>): void;
}

// Supporting types
export interface UserRegistrationData {
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  vibration: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export interface SearchOptions {
  maxResults?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
  region?: string;
  safeSearch?: boolean;
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface ModelCapabilities {
  chat: boolean;
  search: boolean;
  vision: boolean;
  functionCalling: boolean;
  streaming: boolean;
  maxTokens: number;
  supportedLanguages: string[];
}

export interface UserDataExport {
  user: User;
  chatRooms: ChatRoom[];
  messages: ChatMessage[];
  settings: AppSettings;
  exportDate: Date;
  version: string;
}

export interface AppSettings {
  themeId: string;
  languageCode: string;
  notifications: NotificationSettings;
  preferences: UserPreferences;
}

export interface UserPreferences {
  autoSave: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  developerMode: boolean;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
