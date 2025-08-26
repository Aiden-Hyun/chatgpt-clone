// Database layer types - Raw database schema types
// These represent the actual database structure

export interface ChatRoomRow {
  id: number;
  user_id: string;
  title: string | null;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: number;
  room_id: number;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchCacheRow {
  id: string;
  query: string;
  results: any;
  created_at: string;
  updated_at: string;
  expires_at: string;
}
