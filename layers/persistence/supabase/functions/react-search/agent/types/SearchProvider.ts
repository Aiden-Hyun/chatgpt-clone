/**
 * Search Provider Interface and Types
 * 
 * This file defines the interface for search providers and related types
 * to enable a clean, centralized approach to managing different search services.
 */

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchProvider {
  /**
   * Perform a search using this provider
   * 
   * @param query - The search query
   * @param maxResults - Maximum number of results to return
   * @param timeRange - Optional time range filter
   * @returns Promise resolving to search results
   */
  search(query: string, maxResults: number, timeRange?: string): Promise<SearchResponse>;
  
  /**
   * Get the name of this provider
   * 
   * @returns Provider name (e.g., 'tavily', 'bing', 'serpapi')
   */
  getName(): string;
  
  /**
   * Check if this provider is available/configured
   * 
   * @returns True if the provider can be used
   */
  isAvailable(): boolean;
}

export interface SearchProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  [key: string]: any; // Allow additional config options
}

export type SearchProviderName = 'tavily' | 'bing' | 'serpapi';
