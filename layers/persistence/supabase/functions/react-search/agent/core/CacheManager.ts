import type { ReActResult } from "../types/AgentTypes.ts";
import { isTimeSensitive, timeBucketDay } from "../utils/time-utils.ts";
import { CacheKeyBuilder } from "./CacheKeyBuilder.ts";

export interface CacheManagerConfig {
  cacheManager: {
    getAnswerCache: (key: string) => Promise<ReActResult | null>;
    setAnswerCache: (key: string, result: ReActResult, ttl: number) => Promise<boolean>;
  };
  debug?: boolean;
}

export interface ModelInfo {
  reasoningModel: string;
  synthesisModel: string;
}

export interface Budget {
  searches: number;
  fetches: number;
}

/**
 * CacheManager - Handles all caching logic for the ReAct agent
 * 
 * This class manages:
 * - Cache key generation based on question and configuration
 * - Cache checking for existing answers
 * - Cache storage for new results
 * - Time-sensitive vs evergreen caching strategies
 */
export class CacheManager {
  private cfg: CacheManagerConfig;

  constructor(cfg: CacheManagerConfig) {
    this.cfg = cfg;
  }

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  /**
   * Check cache for existing answer
   * 
   * This method:
   * 1. Generates a cache key based on the question and model configuration
   * 2. Checks if a cached answer exists
   * 3. Returns the cached result if found, null otherwise
   * 
   * @param question - The user's question
   * @param modelInfo - Model configuration for cache key generation
   * @param budget - Budget constraints for cache key generation
   * @returns Object containing cached result (if any) and cache key
   */
  async checkCache(
    question: string, 
    modelInfo: ModelInfo, 
    budget: Budget
  ): Promise<{ cached: ReActResult | null; cacheKey: string }> {
    // Create cache key based on question and configuration
    const cacheKey = CacheKeyBuilder.build({
      question,
      dayBucket: isTimeSensitive(question) ? timeBucketDay() : 'evergreen',
      reasoningModel: modelInfo.reasoningModel,
      synthesisModel: modelInfo.synthesisModel,
      searches: budget.searches,
      fetches: budget.fetches,
    });

    console.log(`🔍 [CacheManager] Checking cache with key: ${cacheKey.substring(0, 20)}...`);
    const cached = await this.cfg.cacheManager.getAnswerCache(cacheKey);
    if (cached) {
      console.log(`🎯 [CacheManager] Cache hit! Returning cached result`);
      return { cached, cacheKey };
    }
    console.log(`❌ [CacheManager] No cache hit, proceeding with search`);
    return { cached: null, cacheKey };
  }

  /**
   * Cache the result for future use
   * 
   * @param cacheKey - The cache key to store the result under
   * @param result - The search result to cache
   */
  async setCache(cacheKey: string, result: ReActResult): Promise<void> {
    console.log(`💾 [CacheManager] Caching result with key: ${cacheKey.substring(0, 20)}...`);
    await this.cfg.cacheManager.setAnswerCache(cacheKey, result, 24 * 60 * 60);
  }
}
