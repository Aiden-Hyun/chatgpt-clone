import type { SearchProvider, SearchResponse } from "../types/SearchProvider.ts";

/**
 * SerpAPI Search Provider Implementation
 * 
 * This class wraps the SerpAPI to provide a consistent interface
 * for making search calls to SerpAPI.
 */
export class SerpAPIProvider implements SearchProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://serpapi.com/search") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a search using SerpAPI
   * 
   * @param query - The search query
   * @param maxResults - Maximum number of results to return
   * @param timeRange - Optional time range filter (not supported by SerpAPI)
   * @returns Promise resolving to search results
   */
  async search(query: string, maxResults: number, timeRange?: string): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    // Note: SerpAPI doesn't support timeRange in the same way as Tavily
    // We could implement it using tbs parameter, but for now we'll ignore it
    if (timeRange) {
      console.log(`[SerpAPIProvider] Time range '${timeRange}' not supported by SerpAPI, ignoring`);
    }

    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&num=${maxResults}&api_key=${this.apiKey}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      results: data.organic_results?.map((result: any) => ({
        url: result.link,
        title: result.title,
        snippet: result.snippet
      })) || []
    };
  }

  /**
   * Get the name of this provider
   * 
   * @returns Provider name
   */
  getName(): string {
    return 'serpapi';
  }

  /**
   * Check if this provider is available/configured
   * 
   * @returns True if the provider can be used
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }
}
