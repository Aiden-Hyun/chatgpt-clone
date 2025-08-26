import { ChatMessage, ChatRoom, Language, Theme, User } from '../domain/types';

// State management interfaces
export interface AppState {
  auth: AuthState;
  chat: ChatState;
  settings: SettingsState;
  navigation: NavigationState;
  notifications: NotificationState;
  search: SearchState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: UserSession | null;
  permissions: string[];
  lastActivity: Date;
}

export interface ChatState {
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  currentModel: string;
  isSearchMode: boolean;
  error: string | null;
  drafts: Record<string, string>;
  selectedMessageId: string | null;
  messageStates: Record<string, MessageState>;
}

export interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: NotificationSettings;
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  availableThemes: Theme[];
  availableLanguages: Language[];
}

export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  navigationStack: string[];
  canGoBack: boolean;
  params: Record<string, any>;
  history: NavigationHistoryItem[];
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'default';
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  history: SearchQuery[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  modal: ModalState;
  toast: ToastState;
  sidebar: SidebarState;
  keyboard: KeyboardState;
  network: NetworkState;
}

export interface StateManager {
  getState(): AppState;
  subscribe(callback: (state: AppState) => void): () => void;
  dispatch(action: Action): void;
  getStateSlice<K extends keyof AppState>(slice: K): AppState[K];
  subscribeToSlice<K extends keyof AppState>(slice: K, callback: (state: AppState[K]) => void): () => void;
}

export interface Action {
  type: string;
  payload?: any;
  meta?: Record<string, any>;
  error?: boolean;
}

export interface Reducer<S> {
  (state: S, action: Action): S;
}

export interface Middleware {
  (store: StateManager): (next: (action: Action) => void) => (action: Action) => void;
}

// Supporting types
export interface UserSession {
  id: string;
  userId: string;
  isAuthenticated: boolean;
  permissions: string[];
  lastActivity: Date;
  expiresAt: Date;
  refreshToken: string;
}

export interface MessageState {
  id: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress?: number;
  error?: string;
  retryCount: number;
  lastAttempt: Date;
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
  categories: {
    chat: boolean;
    system: boolean;
    marketing: boolean;
    updates: boolean;
  };
}

export interface UserPreferences {
  autoSave: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  developerMode: boolean;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
}

export interface NavigationHistoryItem {
  route: string;
  params: Record<string, any>;
  timestamp: Date;
  title?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'chat' | 'system' | 'marketing' | 'updates';
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionData?: Record<string, any>;
  expiresAt?: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
  timestamp: Date;
  type: 'web' | 'image' | 'news' | 'academic';
  metadata?: Record<string, any>;
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  clickedResults: string[];
  filters: SearchFilters;
}

export interface SearchFilters {
  type?: 'web' | 'image' | 'news' | 'academic';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
  region?: string;
  safeSearch?: boolean;
  domain?: string;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ToastState {
  toasts: Toast[];
  maxToasts: number;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration: number;
  timestamp: Date;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface SidebarState {
  isOpen: boolean;
  width: number;
  collapsed: boolean;
  activeTab: string;
}

export interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  curve: string;
}

export interface NetworkState {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none';
  isOnline: boolean;
  lastSeen: Date;
  retryCount: number;
}

// Action types
export type AuthAction = 
  | { type: 'AUTH_SIGN_IN_START' }
  | { type: 'AUTH_SIGN_IN_SUCCESS'; payload: { user: User; session: UserSession } }
  | { type: 'AUTH_SIGN_IN_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_SIGN_OUT' }
  | { type: 'AUTH_SESSION_REFRESH'; payload: { session: UserSession } }
  | { type: 'AUTH_UPDATE_USER'; payload: { user: User } };

export type ChatAction =
  | { type: 'CHAT_SET_CURRENT_ROOM'; payload: { room: ChatRoom } }
  | { type: 'CHAT_ADD_MESSAGE'; payload: { message: ChatMessage } }
  | { type: 'CHAT_UPDATE_MESSAGE'; payload: { messageId: string; content: string } }
  | { type: 'CHAT_DELETE_MESSAGE'; payload: { messageId: string } }
  | { type: 'CHAT_SET_TYPING'; payload: { isTyping: boolean } }
  | { type: 'CHAT_SET_MODEL'; payload: { model: string } }
  | { type: 'CHAT_TOGGLE_SEARCH_MODE' }
  | { type: 'CHAT_SET_ERROR'; payload: { error: string | null } };

export type SettingsAction =
  | { type: 'SETTINGS_SET_THEME'; payload: { theme: Theme } }
  | { type: 'SETTINGS_SET_LANGUAGE'; payload: { language: Language } }
  | { type: 'SETTINGS_UPDATE_NOTIFICATIONS'; payload: { settings: Partial<NotificationSettings> } }
  | { type: 'SETTINGS_UPDATE_PREFERENCES'; payload: { preferences: Partial<UserPreferences> } };

export type NavigationAction =
  | { type: 'NAVIGATION_NAVIGATE'; payload: { route: string; params?: Record<string, any> } }
  | { type: 'NAVIGATION_GO_BACK' }
  | { type: 'NAVIGATION_REPLACE'; payload: { route: string; params?: Record<string, any> } }
  | { type: 'NAVIGATION_CLEAR_STACK' };

export type NotificationAction =
  | { type: 'NOTIFICATION_ADD'; payload: { notification: Notification } }
  | { type: 'NOTIFICATION_MARK_READ'; payload: { notificationId: string } }
  | { type: 'NOTIFICATION_DELETE'; payload: { notificationId: string } }
  | { type: 'NOTIFICATION_UPDATE_SETTINGS'; payload: { settings: Partial<NotificationSettings> } };

export type SearchAction =
  | { type: 'SEARCH_SET_QUERY'; payload: { query: string } }
  | { type: 'SEARCH_SET_RESULTS'; payload: { results: SearchResult[] } }
  | { type: 'SEARCH_SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'SEARCH_SET_ERROR'; payload: { error: string | null } }
  | { type: 'SEARCH_UPDATE_FILTERS'; payload: { filters: Partial<SearchFilters> } };

export type UIAction =
  | { type: 'UI_SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'UI_SET_ERROR'; payload: { error: string | null } }
  | { type: 'UI_OPEN_MODAL'; payload: { type: string; data: any; onConfirm?: () => void; onCancel?: () => void } }
  | { type: 'UI_CLOSE_MODAL' }
  | { type: 'UI_ADD_TOAST'; payload: { toast: Omit<Toast, 'id' | 'timestamp'> } }
  | { type: 'UI_REMOVE_TOAST'; payload: { id: string } }
  | { type: 'UI_TOGGLE_SIDEBAR' }
  | { type: 'UI_SET_KEYBOARD'; payload: { isVisible: boolean; height: number } };
