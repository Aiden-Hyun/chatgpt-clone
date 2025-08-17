import { config } from "../../shared/config.ts";

export class SearchService {
  tavilyApiKey;
  bingApiKey;
  serpApiKey;
  cacheManager;
  
  constructor(cacheManager) {
    this.tavilyApiKey = config.secrets.tavily?.apiKey?.() || Deno.env.get("TAVILY_API_KEY") || "";
    this.bingApiKey = Deno.env.get("BING_API_KEY");
    this.serpApiKey = Deno.env.get("SERPAPI_API_KEY");
    this.cacheManager = cacheManager;
  }
  
  async search(query, maxResults = 12, timeRange) {
    console.log(`[SEARCH] Searching for: ${query} (max: ${maxResults}, timeRange: ${timeRange})`);
    
    // Include time range in cache key
    const cacheKey = JSON.stringify({
      q: query,
      k: maxResults,
      timeRange
    });
    
    // Check search cache first
    if (this.cacheManager) {
      const cached = await this.cacheManager.getSearchCache(cacheKey);
      if (cached) {
        console.log(`[SEARCH] Cache hit for query: ${query}`);
        return cached;
      }
    }
    
    let results;
    
    // Try Tavily first
    if (this.tavilyApiKey) {
      try {
        results = await this.searchTavily(query, maxResults, timeRange);
      } catch (error) {
        console.error(`[SEARCH] Tavily failed:`, error);
      }
    }
    
    // Fallback to Bing
    if (!results && this.bingApiKey) {
      try {
        results = await this.searchBing(query, maxResults);
      } catch (error) {
        console.error(`[SEARCH] Bing failed:`, error);
      }
    }
    
    // Fallback to SerpAPI
    if (!results && this.serpApiKey) {
      try {
        results = await this.searchSerpAPI(query, maxResults);
      } catch (error) {
        console.error(`[SEARCH] SerpAPI failed:`, error);
      }
    }
    
    if (!results) {
      throw new Error("No search service available");
    }
    
    // Cache search results BEFORE returning
    if (this.cacheManager) {
      await this.cacheManager.setSearchCache(cacheKey, results, 24 * 60 * 60); // 24 hours
    }
    
    return results;
  }
  
  async searchTavily(query, maxResults, timeRange) {
    const requestBody = {
      query,
      max_results: maxResults,
      include_answer: false,
      search_depth: "basic"
    };
    
    // Add time range if specified
    if (timeRange) {
      requestBody.time_period = timeRange;
      console.log(`[SEARCH] Tavily: Added time_period=${timeRange}`);
    }
    
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.tavilyApiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      results: data.results?.map((result) => ({
        url: result.url,
        title: result.title,
        snippet: result.content
      })) || []
    };
  }
  
  async searchBing(query, maxResults) {
    const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}`, {
      headers: {
        "Ocp-Apim-Subscription-Key": this.bingApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bing API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      results: data.webPages?.value?.map((result) => ({
        url: result.url,
        title: result.name,
        snippet: result.snippet
      })) || []
    };
  }
  
  async searchSerpAPI(query, maxResults) {
    const response = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(query)}&num=${maxResults}&api_key=${this.serpApiKey}`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      results: data.organic_results?.map((result) => ({
        url: result.link,
        title: result.title,
        snippet: result.snippet
      })) || []
    };
  }
}
