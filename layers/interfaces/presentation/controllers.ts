import { Language, Theme, User } from '../domain/types';

// Controller interfaces for handling user interactions
export interface ChatController {
  handleSendMessage(content: string): Promise<void>;
  handleRegenerateMessage(messageId: string): Promise<void>;
  handleModelChange(model: string): Promise<void>;
  handleSearchToggle(): Promise<void>;
  handleMessageEdit(messageId: string, content: string): Promise<void>;
  handleMessageDelete(messageId: string): Promise<void>;
  handleMessageLike(messageId: string): Promise<void>;
  handleMessageDislike(messageId: string): Promise<void>;
  handleClearMessages(): Promise<void>;
  handleLoadHistory(roomId: number): Promise<void>;
}

export interface AuthController {
  handleSignIn(credentials: UserCredentials): Promise<void>;
  handleSignUp(userData: UserRegistrationData): Promise<void>;
  handleSignOut(): Promise<void>;
  handlePasswordReset(email: string): Promise<void>;
  handlePasswordUpdate(currentPassword: string, newPassword: string): Promise<void>;
  handleEmailVerification(token: string): Promise<void>;
  handleSessionRefresh(): Promise<void>;
  handleAutoLogin(): Promise<void>;
}

export interface SettingsController {
  handleThemeChange(themeId: string): Promise<void>;
  handleLanguageChange(languageCode: string): Promise<void>;
  handleProfileUpdate(updates: Partial<User>): Promise<void>;
  handleAvatarUpdate(avatarUrl: string): Promise<void>;
  handleAccountDeletion(): Promise<void>;
  handleDataExport(): Promise<void>;
  handleDataImport(data: any): Promise<void>;
  handleNotificationSettingsUpdate(settings: NotificationSettings): Promise<void>;
}

export interface NavigationController {
  handleNavigateTo(route: string, params?: Record<string, any>): Promise<void>;
  handleGoBack(): Promise<void>;
  handleGoToRoot(): Promise<void>;
  handleReplaceRoute(route: string, params?: Record<string, any>): Promise<void>;
  handleClearStack(): Promise<void>;
  handleDeepLink(url: string): Promise<void>;
  handleTabChange(tabIndex: number): Promise<void>;
}

export interface ChatRoomsController {
  handleCreateRoom(name: string, model: string): Promise<void>;
  handleDeleteRoom(roomId: number): Promise<void>;
  handleSelectRoom(roomId: number): Promise<void>;
  handleRoomNameUpdate(roomId: number, name: string): Promise<void>;
  handleRoomModelUpdate(roomId: number, model: string): Promise<void>;
  handleRoomRefresh(): Promise<void>;
  handleRoomSearch(query: string): Promise<void>;
  handleRoomSort(sortBy: string, sortOrder: 'asc' | 'desc'): Promise<void>;
}

export interface SearchController {
  handleSearch(query: string): Promise<void>;
  handleSearchResultSelect(result: SearchResult): Promise<void>;
  handleSearchHistoryClear(): Promise<void>;
  handleSearchHistoryItemSelect(query: string): Promise<void>;
  handleSearchFilter(filter: SearchFilter): Promise<void>;
  handleSearchSort(sortBy: string, sortOrder: 'asc' | 'desc'): Promise<void>;
  handleSearchExport(): Promise<void>;
}

export interface NotificationController {
  handleNotificationReceived(notification: Notification): Promise<void>;
  handleNotificationRead(notificationId: string): Promise<void>;
  handleAllNotificationsRead(): Promise<void>;
  handleNotificationDelete(notificationId: string): Promise<void>;
  handleNotificationSettingsUpdate(settings: NotificationSettings): Promise<void>;
  handleNotificationPermissionRequest(): Promise<void>;
  handleNotificationSubscription(): Promise<void>;
}

export interface ModelSelectionController {
  handleModelSelect(modelId: string): Promise<void>;
  handleModelRefresh(): Promise<void>;
  handleModelInfoRequest(modelId: string): Promise<void>;
  handleModelComparison(modelIds: string[]): Promise<void>;
  handleModelFavorite(modelId: string): Promise<void>;
  handleModelUnfavorite(modelId: string): Promise<void>;
}

export interface ThemeController {
  handleThemeApply(themeId: string): Promise<void>;
  handleThemeCreate(theme: Partial<Theme>): Promise<void>;
  handleThemeUpdate(themeId: string, updates: Partial<Theme>): Promise<void>;
  handleThemeDelete(themeId: string): Promise<void>;
  handleThemeReset(): Promise<void>;
  handleThemePreview(themeId: string): Promise<void>;
  handleThemeExport(themeId: string): Promise<void>;
  handleThemeImport(themeData: any): Promise<void>;
}

export interface LanguageController {
  handleLanguageChange(languageCode: string): Promise<void>;
  handleLanguageAdd(language: Language): Promise<void>;
  handleLanguageRemove(languageCode: string): Promise<void>;
  handleLanguageReset(): Promise<void>;
  handleLanguageDownload(languageCode: string): Promise<void>;
  handleLanguageUpdate(languageCode: string): Promise<void>;
}

// Supporting types
export interface UserCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  avatarUrl?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
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

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
  timestamp: Date;
  type: 'web' | 'image' | 'news' | 'academic';
}

export interface SearchFilter {
  type?: 'web' | 'image' | 'news' | 'academic';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  language?: string;
  region?: string;
  safeSearch?: boolean;
  domain?: string;
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
}
