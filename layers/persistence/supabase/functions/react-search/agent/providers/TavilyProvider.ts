import type { SearchProvider, SearchResponse } from "../types/SearchProvider.ts";

/**
 * Tavily Search Provider Implementation
 * 
 * This class wraps the Tavily API to provide a consistent interface
 * for making search calls to Tavily.
 */
export class TavilyProvider implements SearchProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.tavily.com/search") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a search using Tavily API
   * 
   * @param query - The search query
   * @param maxResults - Maximum number of results to return
   * @param timeRange - Optional time range filter ('d', 'w', 'm', 'y')
   * @returns Promise resolving to search results
   */
  async search(query: string, maxResults: number, timeRange?: string): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    const requestBody: any = {
      query,
      max_results: maxResults,
      include_answer: false,
      search_depth: "basic"
    };

    // Add time range if specified
    if (timeRange) {
      requestBody.time_period = timeRange;
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      results: data.results?.map((result: any) => ({
        url: result.url,
        title: result.title,
        snippet: result.content
      })) || []
    };
  }

  /**
   * Get the name of this provider
   * 
   * @returns Provider name
   */
  getName(): string {
    return 'tavily';
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
