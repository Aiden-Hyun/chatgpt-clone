// Core domain types that all layers can depend on
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  state: 'pending' | 'loading' | 'complete' | 'error';
  timestamp: Date;
  metadata?: Record<string, any>;
  clientId?: string;
  isLiked?: boolean;
  isDisliked?: boolean;
}

export interface ChatRoom {
  id: number;
  name: string;
  model: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    bold: string;
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: {
    chat: boolean;
    search: boolean;
    vision: boolean;
    functionCalling: boolean;
  };
  maxTokens: number;
  defaultTemperature: number;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  vibration: boolean;
}
