import type { SearchProvider, SearchProviderName, SearchResponse } from "../types/SearchProvider.ts";

/**
 * Search Provider Manager
 * 
 * This class manages all search providers and provides a unified interface
 * for making search calls regardless of the underlying provider.
 * 
 * Benefits:
 * - Centralized search provider management
 * - Consistent interface across all search providers
 * - Easy to add new search providers
 * - Simplified testing and mocking
 * - Unified error handling and logging
 * - Automatic fallback between providers
 */
export class SearchProviderManager {
  private providers: Map<SearchProviderName, SearchProvider> = new Map();
  private debug: boolean;
  private cacheManager?: any;

  constructor(debug: boolean = false, cacheManager?: any) {
    this.debug = debug;
    this.cacheManager = cacheManager;
  }

  /**
   * Register a provider with the manager
   * 
   * @param provider - The provider instance to register
   */
  registerProvider(provider: SearchProvider): void {
    const name = provider.getName() as SearchProviderName;
    this.providers.set(name, provider);
    
    if (this.debug) {
      console.log(`🔍 [SearchProviderManager] Registered provider: ${name}`);
    }
  }

  /**
   * Register multiple providers at once
   * 
   * @param providers - Array of provider instances to register
   */
  registerProviders(providers: SearchProvider[]): void {
    providers.forEach(provider => this.registerProvider(provider));
  }

  /**
   * Make a search call with automatic fallback
   * 
   * @param query - The search query
   * @param maxResults - Maximum number of results
   * @param timeRange - Optional time range filter
   * @param preferredProvider - Preferred provider to try first
   * @returns Promise resolving to search results
   */
  async search(
    query: string, 
    maxResults: number = 12, 
    timeRange?: string,
    preferredProvider?: SearchProviderName
  ): Promise<SearchResponse> {
    if (this.debug) {
      console.log(`🔍 [SearchProviderManager] Searching for: "${query}" (max: ${maxResults}, timeRange: ${timeRange})`);
    }

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
        if (this.debug) {
          console.log(`🔍 [SearchProviderManager] Cache hit for query: "${query}"`);
        }
        return cached;
      }
    }

    // Determine provider order (preferred first, then fallbacks)
    const providerOrder: SearchProviderName[] = [];
    if (preferredProvider && this.providers.has(preferredProvider)) {
      providerOrder.push(preferredProvider);
    }
    
    // Add remaining providers in order of preference
    const remainingProviders: SearchProviderName[] = ['tavily', 'bing', 'serpapi'];
    for (const provider of remainingProviders) {
      if (provider !== preferredProvider && this.providers.has(provider)) {
        providerOrder.push(provider);
      }
    }

    if (providerOrder.length === 0) {
      throw new Error('No search providers available');
    }

    // Try providers in order with fallback
    let lastError: Error | null = null;
    
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (!provider || !provider.isAvailable()) {
        continue;
      }

      try {
        if (this.debug) {
          console.log(`🔍 [SearchProviderManager] Trying ${providerName} for query: "${query}"`);
        }

        const response = await provider.search(query, maxResults, timeRange);
        
        if (this.debug) {
          console.log(`🔍 [SearchProviderManager] ${providerName} returned ${response.results.length} results`);
        }

        // Cache successful results
        if (this.cacheManager) {
          await this.cacheManager.setSearchCache(cacheKey, response, 24 * 60 * 60); // 24 hours
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (this.debug) {
          console.error(`🔍 [SearchProviderManager] ${providerName} failed:`, error);
        }
        // Continue to next provider
      }
    }

    // All providers failed
    throw new Error(`All search providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Check if a provider is registered
   * 
   * @param providerName - Name of the provider to check
   * @returns True if the provider is registered
   */
  hasProvider(providerName: SearchProviderName): boolean {
    return this.providers.has(providerName);
  }

  /**
   * Get a list of all registered providers
   * 
   * @returns Array of provider names
   */
  getRegisteredProviders(): SearchProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get a specific provider instance
   * 
   * @param providerName - Name of the provider to get
   * @returns The provider instance or undefined if not found
   */
  getProvider(providerName: SearchProviderName): SearchProvider | undefined {
    return this.providers.get(providerName);
  }

  /**
   * Remove a provider from the manager
   * 
   * @param providerName - Name of the provider to remove
   * @returns True if the provider was removed, false if it wasn't found
   */
  removeProvider(providerName: SearchProviderName): boolean {
    const removed = this.providers.delete(providerName);
    
    if (this.debug && removed) {
      console.log(`🔍 [SearchProviderManager] Removed provider: ${providerName}`);
    }
    
    return removed;
  }

  /**
   * Clear all registered providers
   */
  clearProviders(): void {
    this.providers.clear();
    
    if (this.debug) {
      console.log(`🔍 [SearchProviderManager] Cleared all providers`);
    }
  }
}
