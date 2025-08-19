import type { SearchProvider, SearchResponse } from "../types/SearchProvider.ts";

/**
 * Bing Search Provider Implementation
 * 
 * This class wraps the Bing Search API to provide a consistent interface
 * for making search calls to Bing.
 */
export class BingProvider implements SearchProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.bing.microsoft.com/v7.0/search") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a search using Bing API
   * 
   * @param query - The search query
   * @param maxResults - Maximum number of results to return
   * @param timeRange - Optional time range filter (not supported by Bing)
   * @returns Promise resolving to search results
   */
  async search(query: string, maxResults: number, timeRange?: string): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('Bing API key not configured');
    }

    // Note: Bing doesn't support timeRange in the same way as Tavily
    // We could implement it using freshness parameter, but for now we'll ignore it
    if (timeRange) {
      console.log(`[BingProvider] Time range '${timeRange}' not supported by Bing, ignoring`);
    }

    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&count=${maxResults}`;
    
    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      results: data.webPages?.value?.map((result: any) => ({
        url: result.url,
        title: result.name,
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
    return 'bing';
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
