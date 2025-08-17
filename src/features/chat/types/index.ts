// src/features/chat/types/index.ts
import { SearchResult } from '../services/interfaces/ISearchService';

export type MessageState = 
  | 'loading'      // AI generating response (show LoadingMessage)
  | 'animating'    // Typewriter animation active
  | 'completed'    // Static display
  | 'hydrated'     // Loaded from DB (never animate)
  | 'error';       // Error state

export type ChatMessage = {
  role: 'user' | 'assistant' | 'search-results';
  content: string;
  state?: MessageState;     // Add optional state
  fullContent?: string;     // Add full content for loading state
  id?: string;             // Add unique identifier
  // Like/dislike feedback state
  isLiked?: boolean;
  isDisliked?: boolean;
  // Search-related fields
  searchResults?: SearchResult[];
  searchQuery?: string;
};
