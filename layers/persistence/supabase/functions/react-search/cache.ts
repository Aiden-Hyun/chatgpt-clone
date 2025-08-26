import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Cache types supported by the CacheManager
 */
export type CacheType = 'search' | 'url' | 'answer';

/**
 * Cache entry interface
 */
export interface CacheEntry {
  id?: number;
  cache_type: CacheType;
  key: string;
  value: any;
  created_at?: string;
  expires_at: string;
  metadata?: Record<string, any>;
}

/**
 * Improved CacheManager with better error handling and diagnostics
 */
export class CacheManager {
  private client: SupabaseClient;
  private memoryCache: Map<string, { value: any; expires_at: number }> = new Map();
  private tableName = 'agent_cache';
  private debug: boolean;
  private cacheEnabled: boolean;
  private memCacheEnabled: boolean;
  private cacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    sets: 0
  };

  /**
   * Create a new CacheManager
   * @param client Supabase client with appropriate permissions
   * @param options Configuration options
   */
  constructor(
    client: SupabaseClient, 
    options: { 
      debug?: boolean; 
      cacheEnabled?: boolean;
      memCacheEnabled?: boolean;
      tableName?: string;
    } = {}
  ) {
    this.client = client;
    this.debug = options.debug ?? false;
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.memCacheEnabled = options.memCacheEnabled ?? true;
    this.tableName = options.tableName ?? 'agent_cache';
    
    if (this.debug) {
      console.log(`[CACHE] Initialized with table: ${this.tableName}, cache enabled: ${this.cacheEnabled}, memory cache: ${this.memCacheEnabled}`);
    }
  }

  /**
   * Generate a composite cache key
   * @param cacheType The type of cache
   * @param key The base key
   * @returns Composite cache key
   */
  private getCacheKey(cacheType: CacheType, key: string): string {
    return `${cacheType}:${key}`;
  }

  /**
   * Get an item from cache
   * @param cacheType The type of cache to use
   * @param key The cache key
   * @returns Cached value or null if not found
   */
  async get(cacheType: CacheType, key: string): Promise<any | null> {
    if (!this.cacheEnabled) {
      return null;
    }

    const compositeKey = this.getCacheKey(cacheType, key);
    
    // Check memory cache first if enabled
    if (this.memCacheEnabled) {
      const memItem = this.memoryCache.get(compositeKey);
      if (memItem && memItem.expires_at > Date.now()) {
        this.cacheStats.hits++;
        if (this.debug) {
          console.log(`[CACHE] Memory cache hit for ${cacheType}:${key.substring(0, 20)}...`);
        }
        return memItem.value;
      }
    }

    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('value, expires_at')
        .eq('cache_type', cacheType)
        .eq('key', key)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no results

      if (error) {
        this.cacheStats.errors++;
        console.error(`[CACHE] Error getting ${cacheType}:${key}:`, error);
        return null;
      }

      if (!data) {
        this.cacheStats.misses++;
        if (this.debug) {
          console.log(`[CACHE] Miss for ${cacheType}:${key.substring(0, 20)}...`);
        }
        return null;
      }

      // Store in memory cache if enabled
      if (this.memCacheEnabled) {
        this.memoryCache.set(compositeKey, {
          value: data.value,
          expires_at: new Date(data.expires_at).getTime()
        });
      }

      this.cacheStats.hits++;
      if (this.debug) {
        console.log(`[CACHE] Database hit for ${cacheType}:${key.substring(0, 20)}...`);
      }
      return data.value;
    } catch (error) {
      this.cacheStats.errors++;
      console.error(`[CACHE] Exception getting ${cacheType}:${key}:`, error);
      return null;
    }
  }

  /**
   * Store an item in cache
   * @param cacheType The type of cache to use
   * @param key The cache key
   * @param value The value to cache
   * @param ttlSeconds Time to live in seconds
   * @param metadata Optional metadata for debugging
   * @returns Promise resolving to success status
   */
  async set(
    cacheType: CacheType, 
    key: string, 
    value: any, 
    ttlSeconds: number = 24 * 60 * 60,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    if (!this.cacheEnabled) {
      return true;
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const compositeKey = this.getCacheKey(cacheType, key);
    
    // Store in memory cache if enabled
    if (this.memCacheEnabled) {
      this.memoryCache.set(compositeKey, {
        value,
        expires_at: expiresAt.getTime()
      });
    }

    try {
      // Add diagnostic info to metadata
      const enhancedMetadata = {
        ...metadata,
        cached_at: new Date().toISOString(),
        ttl_seconds: ttlSeconds
      };

      const { error } = await this.client
        .from(this.tableName)
        .upsert({
          cache_type: cacheType,
          key,
          value,
          expires_at: expiresAt.toISOString(),
          metadata: enhancedMetadata
        }, {
          onConflict: 'cache_type,key'
        });

      if (error) {
        this.cacheStats.errors++;
        console.error(`[CACHE] Error setting ${cacheType}:${key}:`, error);
        return false;
      }

      this.cacheStats.sets++;
      if (this.debug) {
        console.log(`[CACHE] Set ${cacheType}:${key.substring(0, 20)}..., expires: ${expiresAt.toISOString()}`);
      }
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      console.error(`[CACHE] Exception setting ${cacheType}:${key}:`, error);
      
      // Even if DB storage fails, we still have it in memory cache
      return this.memCacheEnabled;
    }
  }

  /**
   * Get search results from cache
   * @param cacheKey The search cache key
   * @returns Cached search results or null
   */
  async getSearchCache(cacheKey: string): Promise<any | null> {
    return this.get('search', cacheKey);
  }

  /**
   * Store search results in cache
   * @param cacheKey The search cache key
   * @param results The search results
   * @param ttlSeconds Time to live in seconds
   * @returns Promise resolving to success status
   */
  async setSearchCache(
    cacheKey: string, 
    results: any, 
    ttlSeconds: number = 24 * 60 * 60
  ): Promise<boolean> {
    return this.set('search', cacheKey, results, ttlSeconds, {
      result_count: Array.isArray(results?.results) ? results.results.length : 0
    });
  }

  /**
   * Get URL content from cache
   * @param url The URL
   * @returns Cached URL content or null
   */
  async getUrlCache(url: string): Promise<any | null> {
    const key = this.hashString(url);
    return this.get('url', key);
  }

  /**
   * Store URL content in cache
   * @param url The URL
   * @param content The URL content
   * @param ttlSeconds Time to live in seconds
   * @returns Promise resolving to success status
   */
  async setUrlCache(
    url: string, 
    content: any, 
    ttlSeconds: number = 7 * 24 * 60 * 60
  ): Promise<boolean> {
    const key = this.hashString(url);
    return this.set('url', key, content, ttlSeconds, {
      original_url: url,
      content_length: content?.text?.length || 0
    });
  }

  /**
   * Get answer from cache
   * @param question The question or cache key
   * @returns Cached answer or null
   */
  async getAnswerCache(question: string): Promise<any | null> {
    const key = this.hashString(question);
    return this.get('answer', key);
  }

  /**
   * Store answer in cache
   * @param question The question or cache key
   * @param answer The answer
   * @param ttlSeconds Time to live in seconds
   * @returns Promise resolving to success status
   */
  async setAnswerCache(
    question: string, 
    answer: any, 
    ttlSeconds: number = 24 * 60 * 60
  ): Promise<boolean> {
    const key = this.hashString(question);
    return this.set('answer', key, answer, ttlSeconds, {
      question_length: question.length,
      answer_length: answer?.final_answer_md?.length || 0,
      citation_count: answer?.citations?.length || 0
    });
  }

  /**
   * Delete expired cache entries
   * @returns Promise resolving to number of deleted entries
   */
  async cleanupExpired(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.client
        .from(this.tableName)
        .delete()
        .lt('expires_at', now)
        .select('id');

      if (error) {
        console.error(`[CACHE] Error cleaning up expired entries:`, error);
        return 0;
      }
      
      const deletedCount = data?.length || 0;
      if (this.debug) {
        console.log(`[CACHE] Cleaned up ${deletedCount} expired entries`);
      }
      
      // Also clean up memory cache
      if (this.memCacheEnabled) {
        const now = Date.now();
        let memoryDeleted = 0;
        
        for (const [key, item] of this.memoryCache.entries()) {
          if (item.expires_at < now) {
            this.memoryCache.delete(key);
            memoryDeleted++;
          }
        }
        
        if (this.debug && memoryDeleted > 0) {
          console.log(`[CACHE] Cleaned up ${memoryDeleted} expired memory cache entries`);
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error(`[CACHE] Exception cleaning up expired entries:`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): Record<string, any> {
    return {
      ...this.cacheStats,
      memoryEntries: this.memoryCache.size,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses || 1)
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      errors: 0,
      sets: 0
    };
  }

  /**
   * Get diagnostic information about the cache
   * @returns Promise resolving to cache diagnostics
   */
  async getDiagnostics(): Promise<Record<string, any>> {
    try {
      const { data: counts, error: countError } = await this.client
        .from(this.tableName)
        .select('cache_type, count(*)', { count: 'exact' })
        .group('cache_type');

      const { data: expired, error: expiredError } = await this.client
        .from(this.tableName)
        .select('count(*)', { count: 'exact' })
        .lt('expires_at', new Date().toISOString());

      if (countError || expiredError) {
        console.error(`[CACHE] Error getting diagnostics:`, countError || expiredError);
      }

      return {
        stats: this.getStats(),
        db: {
          counts: counts || [],
          expired: expired?.length || 0,
          error: countError || expiredError || null
        }
      };
    } catch (error) {
      console.error(`[CACHE] Exception getting diagnostics:`, error);
      return {
        stats: this.getStats(),
        db: {
          error: String(error)
        }
      };
    }
  }

  /**
   * Hash a string to create a cache key
   * @param str The string to hash
   * @returns The hashed string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}