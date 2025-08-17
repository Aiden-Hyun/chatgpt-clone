// src/features/chat/services/implementations/GoogleCustomSearchService.ts
import { ISearchService, SearchOptions, SearchResponse, SearchResult } from '../interfaces/ISearchService';

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
  pagemap?: {
    metatags?: Array<{
      'og:site_name'?: string;
    }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults?: string;
    searchTime?: number;
  };
  queries?: {
    request?: Array<{
      searchTerms?: string;
    }>;
  };
}

export class GoogleCustomSearchService implements ISearchService {
  private readonly baseUrl = 'https://www.googleapis.com/customsearch/v1';
  private readonly searchEngineId = '4415b473618724a6b'; // Your Search Engine ID
  private readonly maxResults: number;

  constructor(maxResults: number = 5) {
    this.maxResults = maxResults;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`[GoogleCustomSearchService] Searching for: "${query}"`);
      
      // Get API key from environment (client-side)
      const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
      if (!apiKey) {
        throw new Error('Google Cloud API key not found in environment variables');
      }

      // Build the search URL
      const params = new URLSearchParams({
        key: apiKey,
        cx: this.searchEngineId,
        q: query,
        num: Math.min(options?.maxResults || this.maxResults, 10).toString(), // Google allows max 10 per request
      });

      // Add optional parameters
      if (options?.timeRange) {
        // Google doesn't support timeRange directly, but we can add date restrictions
        const dateRestrict = this.getDateRestriction(options.timeRange);
        if (dateRestrict) {
          params.append('dateRestrict', dateRestrict);
        }
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GoogleCustomSearchService] API error: ${response.status} ${response.statusText}`);
        console.error(`[GoogleCustomSearchService] Error details: ${errorText}`);
        throw new Error(`Google Custom Search API error: ${response.status} ${response.statusText}`);
      }

      const data: GoogleSearchResponse = await response.json();
      
      console.log(`[GoogleCustomSearchService] Raw response:`, {
        hasItems: !!data.items,
        itemCount: data.items?.length || 0,
        totalResults: data.searchInformation?.totalResults,
        searchTime: data.searchInformation?.searchTime
      });

      const results: SearchResult[] = [];
      
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          results.push({
            title: item.title,
            snippet: item.snippet,
            url: item.link,
            source: this.extractSource(item),
            timestamp: new Date().toISOString(),
          });
        }
      }

      const searchTime = Date.now() - startTime;
      
      console.log(`[GoogleCustomSearchService] Found ${results.length} results in ${searchTime}ms`);
      
      return {
        results: results.slice(0, options?.maxResults || this.maxResults),
        query,
        totalResults: parseInt(data.searchInformation?.totalResults || '0'),
        searchTime,
      };
      
    } catch (error) {
      console.error('[GoogleCustomSearchService] Search failed:', error);
      throw new Error(`Google Custom Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractSource(item: GoogleSearchItem): string {
    // Try to extract the source from various fields
    if (item.pagemap?.metatags?.[0]?.['og:site_name']) {
      return item.pagemap.metatags[0]['og:site_name'];
    }
    
    if (item.displayLink) {
      return item.displayLink;
    }
    
    // Extract domain from URL
    try {
      const url = new URL(item.link);
      return url.hostname.replace('www.', '');
    } catch {
      return 'Google Search';
    }
  }

  private getDateRestriction(timeRange: string): string | null {
    switch (timeRange) {
      case 'day': return 'd1';
      case 'week': return 'w1';
      case 'month': return 'm1';
      case 'year': return 'y1';
      default: return null;
    }
  }

  isAvailable(): boolean {
    const hasApiKey = !!process.env.GOOGLE_CLOUD_API_KEY;
    const hasSearchEngineId = !!this.searchEngineId;
    
    console.log(`[GoogleCustomSearchService] isAvailable check:`);
    console.log(`[GoogleCustomSearchService] - API Key available: ${hasApiKey}`);
    console.log(`[GoogleCustomSearchService] - Search Engine ID available: ${hasSearchEngineId}`);
    console.log(`[GoogleCustomSearchService] - Search Engine ID: ${this.searchEngineId}`);
    
    return !!(hasApiKey && hasSearchEngineId);
  }

  getProviderName(): string {
    return 'Google Custom Search';
  }
}
