// src/features/chat/services/interfaces/ISearchService.ts

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  timestamp?: string;
}

export interface SearchOptions {
  maxResults?: number;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  region?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalResults?: number;
  searchTime?: number;
}

export interface ISearchService {
  /**
   * Perform a web search and return results
   */
  search(query: string, options?: SearchOptions): Promise<SearchResponse>;
  
  /**
   * Check if the search service is available/configured
   */
  isAvailable(): boolean;
  
  /**
   * Get the name/identifier of this search provider
   */
  getProviderName(): string;
}

