import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface CacheEntry {
  key: string;
  value: any;
  expires_at: Date;
}

export class CacheManager {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Route to correct tables with table parameter
  async get(key: string, table = 'url_cache'): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from(table)
        .select('value, expires_at')
        .eq('key', key)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      console.log(`[CACHE] Hit for key: ${key} in ${table}`);
      return data.value;
    } catch (error) {
      console.error(`[CACHE] Error getting key ${key} from ${table}:`, error);
      return null;
    }
  }

  // Route to correct tables with table parameter
  async set(key: string, value: any, ttlSeconds: number, table = 'url_cache'): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      
      const { error } = await this.client
        .from(table)
        .upsert({
          key,
          value,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`[CACHE] Error setting key ${key} in ${table}:`, error);
      } else {
        console.log(`[CACHE] Set key: ${key} in ${table}, expires: ${expiresAt.toISOString()}`);
      }
    } catch (error) {
      console.error(`[CACHE] Error setting key ${key} in ${table}:`, error);
    }
  }

  // Use search_cache table for search results (with parameterized keys)
  async getSearchCache(cacheKey: string): Promise<any | null> {
    return this.get(cacheKey, 'search_cache');
  }

  // Use search_cache table for search results (with parameterized keys)
  async setSearchCache(cacheKey: string, results: any, ttlSeconds: number = 24 * 60 * 60): Promise<void> {
    return this.set(cacheKey, results, ttlSeconds, 'search_cache');
  }

  // Use url_cache table for URL content
  async getUrlCache(url: string): Promise<any | null> {
    const key = `url:${this.hashString(url)}`;
    return this.get(key, 'url_cache');
  }

  // Use url_cache table for URL content
  async setUrlCache(url: string, content: any, ttlSeconds: number = 7 * 24 * 60 * 60): Promise<void> {
    const key = `url:${this.hashString(url)}`;
    return this.set(key, content, ttlSeconds, 'url_cache');
  }

  // Use search_cache table for answer cache
  async getAnswerCache(question: string): Promise<any | null> {
    const key = `answer:${this.hashString(question)}`;
    return this.get(key, 'search_cache');
  }

  // Use search_cache table for answer cache
  async setAnswerCache(question: string, answer: any, ttlSeconds: number = 24 * 60 * 60): Promise<void> {
    const key = `answer:${this.hashString(question)}`;
    return this.set(key, answer, ttlSeconds, 'search_cache');
  }

  // Cleanup both tables
  async cleanupExpired(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { error: urlError } = await this.client
        .from('url_cache')
        .delete()
        .lt('expires_at', now);

      const { error: searchError } = await this.client
        .from('search_cache')
        .delete()
        .lt('expires_at', now);

      if (urlError) {
        console.error(`[CACHE] Error cleaning up url_cache:`, urlError);
      }
      if (searchError) {
        console.error(`[CACHE] Error cleaning up search_cache:`, searchError);
      }
      
      console.log(`[CACHE] Cleaned up expired entries from both tables`);
    } catch (error) {
      console.error(`[CACHE] Error cleaning up expired entries:`, error);
    }
  }

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
