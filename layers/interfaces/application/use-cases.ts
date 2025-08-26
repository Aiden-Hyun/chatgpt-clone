import { AIModel, ChatMessage, ChatRoom, Language, Theme, User } from '../domain/types';

// Use case interfaces for business operations
export interface SendMessageUseCase {
  execute(request: SendMessageRequest): Promise<SendMessageResponse>;
}

export interface LoadChatHistoryUseCase {
  execute(roomId: number): Promise<ChatMessage[]>;
}

export interface AuthenticateUserUseCase {
  execute(credentials: UserCredentials): Promise<AuthenticationResult>;
}

export interface ManageThemeUseCase {
  execute(request: ThemeRequest): Promise<ThemeResponse>;
}

export interface ManageLanguageUseCase {
  execute(request: LanguageRequest): Promise<LanguageResponse>;
}

export interface CreateChatRoomUseCase {
  execute(request: CreateChatRoomRequest): Promise<CreateChatRoomResponse>;
}

export interface DeleteChatRoomUseCase {
  execute(roomId: number): Promise<DeleteChatRoomResponse>;
}

export interface RegenerateMessageUseCase {
  execute(request: RegenerateMessageRequest): Promise<RegenerateMessageResponse>;
}

export interface SearchMessagesUseCase {
  execute(request: SearchMessagesRequest): Promise<SearchMessagesResponse>;
}

export interface UpdateUserProfileUseCase {
  execute(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse>;
}

export interface GetAvailableModelsUseCase {
  execute(): Promise<AIModel[]>;
}

// Request/Response DTOs
export interface SendMessageRequest {
  roomId: number;
  content: string;
  model: string;
  isSearchMode?: boolean;
  messageId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  roomId?: number;
  error?: string;
  duration?: number;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  session?: UserSession;
  error?: string;
}

export interface ThemeRequest {
  action: 'get' | 'set' | 'list';
  themeId?: string;
}

export interface ThemeResponse {
  success: boolean;
  theme?: Theme;
  themes?: Theme[];
  error?: string;
}

export interface LanguageRequest {
  action: 'get' | 'set' | 'list';
  languageCode?: string;
}

export interface LanguageResponse {
  success: boolean;
  language?: Language;
  languages?: Language[];
  error?: string;
}

export interface CreateChatRoomRequest {
  name: string;
  model: string;
  userId: string;
}

export interface CreateChatRoomResponse {
  success: boolean;
  room?: ChatRoom;
  error?: string;
}

export interface DeleteChatRoomResponse {
  success: boolean;
  error?: string;
}

export interface RegenerateMessageRequest {
  messageId: string;
  roomId: number;
  model: string;
  isSearchMode?: boolean;
}

export interface RegenerateMessageResponse {
  success: boolean;
  newMessageId?: string;
  error?: string;
}

export interface SearchMessagesRequest {
  roomId: number;
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchMessagesResponse {
  success: boolean;
  messages?: ChatMessage[];
  total?: number;
  error?: string;
}

export interface UpdateUserProfileRequest {
  userId: string;
  updates: Partial<User>;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UserSession {
  user: User;
  isAuthenticated: boolean;
  permissions: string[];
}
