import { AIModel, ChatMessage, ChatRoom, Language, Theme, User } from '../domain/types';

// View model interfaces for UI state
export interface ChatViewModel {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  currentModel: string;
  isSearchMode: boolean;
  roomId: number | null;
  error: string | null;
  
  // UI actions
  sendMessage(content: string): Promise<void>;
  regenerateMessage(messageId: string): Promise<void>;
  switchModel(model: string): Promise<void>;
  toggleSearchMode(): Promise<void>;
  clearMessages(): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  editMessage(messageId: string, content: string): Promise<void>;
  likeMessage(messageId: string): Promise<void>;
  dislikeMessage(messageId: string): Promise<void>;
}

export interface AuthViewModel {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(currentPassword: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

export interface SettingsViewModel {
  currentTheme: Theme;
  currentLanguage: Language;
  availableThemes: Theme[];
  availableLanguages: Language[];
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  changeTheme(themeId: string): Promise<void>;
  changeLanguage(languageCode: string): Promise<void>;
  updateProfile(updates: Partial<User>): Promise<void>;
  updateAvatar(avatarUrl: string): Promise<void>;
  deleteAccount(): Promise<void>;
  exportData(): Promise<void>;
  importData(data: any): Promise<void>;
}

export interface ChatRoomsViewModel {
  rooms: ChatRoom[];
  selectedRoomId: number | null;
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  createRoom(name: string, model: string): Promise<void>;
  deleteRoom(roomId: number): Promise<void>;
  selectRoom(roomId: number): Promise<void>;
  updateRoomName(roomId: number, name: string): Promise<void>;
  updateRoomModel(roomId: number, model: string): Promise<void>;
  refreshRooms(): Promise<void>;
}

export interface NavigationViewModel {
  currentRoute: string;
  previousRoute: string | null;
  canGoBack: boolean;
  navigationStack: string[];
  
  // UI actions
  navigateTo(route: string, params?: Record<string, any>): Promise<void>;
  goBack(): Promise<void>;
  goToRoot(): Promise<void>;
  replaceRoute(route: string, params?: Record<string, any>): Promise<void>;
  clearStack(): Promise<void>;
}

export interface NotificationViewModel {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  
  // UI actions
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  updateSettings(settings: Partial<NotificationSettings>): Promise<void>;
  refreshNotifications(): Promise<void>;
}

export interface SearchViewModel {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchQuery[];
  
  // UI actions
  search(query: string): Promise<void>;
  clearResults(): Promise<void>;
  clearHistory(): Promise<void>;
  selectResult(result: SearchResult): Promise<void>;
  saveToHistory(query: string): Promise<void>;
}

export interface ModelSelectionViewModel {
  availableModels: AIModel[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  selectModel(modelId: string): Promise<void>;
  refreshModels(): Promise<void>;
  getModelInfo(modelId: string): Promise<AIModel | null>;
}

export interface ThemeViewModel {
  currentTheme: Theme;
  availableThemes: Theme[];
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  applyTheme(themeId: string): Promise<void>;
  createCustomTheme(theme: Partial<Theme>): Promise<void>;
  updateTheme(themeId: string, updates: Partial<Theme>): Promise<void>;
  deleteTheme(themeId: string): Promise<void>;
  resetToDefault(): Promise<void>;
}

export interface LanguageViewModel {
  currentLanguage: Language;
  availableLanguages: Language[];
  isLoading: boolean;
  error: string | null;
  
  // UI actions
  changeLanguage(languageCode: string): Promise<void>;
  addLanguage(language: Language): Promise<void>;
  removeLanguage(languageCode: string): Promise<void>;
  resetToDefault(): Promise<void>;
}

// Supporting types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
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

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
  timestamp: Date;
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  clickedResults: string[];
}
