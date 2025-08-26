import { ChatMessage, ChatRoom, Language, Theme, User } from '../domain/types';
import { FilterParams, PaginationParams, SortParams } from '../domain/value-objects';

// Repository interfaces for data access
export interface ChatMessageRepository {
  save(message: ChatMessage): Promise<void>;
  saveBatch(messages: ChatMessage[]): Promise<void>;
  findByRoomId(roomId: number, options?: QueryOptions): Promise<ChatMessage[]>;
  findById(id: string): Promise<ChatMessage | null>;
  findByClientId(clientId: string): Promise<ChatMessage | null>;
  update(id: string, content: string): Promise<void>;
  updateBatch(updates: Array<{ id: string; content: string }>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByRoomId(roomId: number): Promise<void>;
  countByRoomId(roomId: number): Promise<number>;
  search(roomId: number, query: string, options?: QueryOptions): Promise<ChatMessage[]>;
}

export interface ChatRoomRepository {
  create(room: Partial<ChatRoom>): Promise<ChatRoom>;
  findById(id: number): Promise<ChatRoom | null>;
  findByUserId(userId: string, options?: QueryOptions): Promise<ChatRoom[]>;
  findByName(userId: string, name: string): Promise<ChatRoom | null>;
  update(id: number, updates: Partial<ChatRoom>): Promise<void>;
  updateModel(id: number, model: string): Promise<void>;
  updateName(id: number, name: string): Promise<void>;
  delete(id: number): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
  exists(id: number): Promise<boolean>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<void>;
  updateProfile(id: string, profile: Partial<User>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}

export interface ThemeRepository {
  findById(id: string): Promise<Theme | null>;
  findAll(): Promise<Theme[]>;
  findDefault(): Promise<Theme | null>;
  save(theme: Theme): Promise<void>;
  update(id: string, updates: Partial<Theme>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface LanguageRepository {
  findByCode(code: string): Promise<Language | null>;
  findAll(): Promise<Language[]>;
  findDefault(): Promise<Language | null>;
  save(language: Language): Promise<void>;
  update(code: string, updates: Partial<Language>): Promise<void>;
  delete(code: string): Promise<void>;
  exists(code: string): Promise<boolean>;
}

export interface UserSessionRepository {
  save(session: UserSession): Promise<void>;
  findById(id: string): Promise<UserSession | null>;
  findByUserId(userId: string): Promise<UserSession | null>;
  update(id: string, updates: Partial<UserSession>): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface AppSettingsRepository {
  save(settings: AppSettings): Promise<void>;
  findByUserId(userId: string): Promise<AppSettings | null>;
  update(userId: string, updates: Partial<AppSettings>): Promise<void>;
  delete(userId: string): Promise<void>;
  exists(userId: string): Promise<boolean>;
}

// Query options for repositories
export interface QueryOptions {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParams[];
  includeDeleted?: boolean;
}

// UserSession and AppSettings types
export interface UserSession {
  id: string;
  userId: string;
  isAuthenticated: boolean;
  permissions: string[];
  lastActivity: Date;
  expiresAt: Date;
}

export interface AppSettings {
  userId: string;
  themeId: string;
  languageCode: string;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  vibration: boolean;
}
