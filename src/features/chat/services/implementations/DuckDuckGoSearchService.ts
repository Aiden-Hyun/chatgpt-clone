// src/features/chat/services/implementations/DuckDuckGoSearchService.ts
import { ISearchService, SearchOptions, SearchResponse, SearchResult } from '../interfaces/ISearchService';

interface DuckDuckGoResponse {
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  RelatedTopics?: Array<{
    Text?: string;
    FirstURL?: string;
  }>;
  Answer?: string;
  AnswerType?: string;
  Definition?: string;
  DefinitionSource?: string;
  Heading?: string;
  Image?: string;
  Redirect?: string;
  Type?: string;
}

export class DuckDuckGoSearchService implements ISearchService {
  private readonly baseUrl = 'https://api.duckduckgo.com/';
  private readonly maxResults: number;

  constructor(maxResults: number = 5) {
    this.maxResults = maxResults;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`[DuckDuckGoSearchService] Searching for: "${query}"`);
      
      // DuckDuckGo Instant Answer API
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        no_html: '1',
        skip_disambig: '1',
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status} ${response.statusText}`);
      }

      // Debug: Log the response details
      console.log(`[DuckDuckGoSearchService] Response status: ${response.status}`);
      console.log(`[DuckDuckGoSearchService] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`[DuckDuckGoSearchService] Response text length: ${responseText.length}`);
      console.log(`[DuckDuckGoSearchService] Response text preview: ${responseText.substring(0, 200)}...`);
      
      if (!responseText.trim()) {
        throw new Error('Empty response from DuckDuckGo API');
      }

      let data: DuckDuckGoResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[DuckDuckGoSearchService] JSON parse error:', parseError);
        console.error('[DuckDuckGoSearchService] Full response text:', responseText);
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      const results: SearchResult[] = [];
      
      // Add main abstract result if available
      if (data.AbstractText && data.AbstractURL) {
        results.push({
          title: data.Heading || 'Search Result',
          snippet: data.AbstractText,
          url: data.AbstractURL,
          source: data.AbstractSource || 'DuckDuckGo',
          timestamp: new Date().toISOString(),
        });
      }

      // Add related topics as additional results
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, this.maxResults - results.length)) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo Related',
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      // If we have an answer, add it as a result
      if (data.Answer && !results.some(r => r.snippet.includes(data.Answer!))) {
        results.unshift({
          title: 'Direct Answer',
          snippet: data.Answer,
          url: data.AbstractURL || '',
          source: 'DuckDuckGo Answer',
          timestamp: new Date().toISOString(),
        });
      }

      const searchTime = Date.now() - startTime;
      
      console.log(`[DuckDuckGoSearchService] Found ${results.length} results in ${searchTime}ms`);
      
      return {
        results: results.slice(0, options?.maxResults || this.maxResults),
        query,
        totalResults: results.length,
        searchTime,
      };
      
    } catch (error) {
      console.error('[DuckDuckGoSearchService] Search failed:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isAvailable(): boolean {
    // DuckDuckGo API is always available (no API key required)
    return true;
  }

  getProviderName(): string {
    return 'DuckDuckGo';
  }
}
