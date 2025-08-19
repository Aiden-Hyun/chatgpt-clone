import type { AIProvider, AIProviderConfig, AIProviderResponse, ProviderName } from "../types/AIProvider.ts";

/**
 * AI Provider Manager
 * 
 * This class manages all AI providers and provides a unified interface
 * for making API calls regardless of the underlying provider.
 * 
 * Benefits:
 * - Centralized provider management
 * - Consistent interface across all providers
 * - Easy to add new providers
 * - Simplified testing and mocking
 * - Unified error handling and logging
 */
export class AIProviderManager {
  private providers: Map<ProviderName, AIProvider> = new Map();
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Register a provider with the manager
   * 
   * @param provider - The provider instance to register
   */
  registerProvider(provider: AIProvider): void {
    const name = provider.getName() as ProviderName;
    this.providers.set(name, provider);
    
    if (this.debug) {
      console.log(`🤖 [AIProviderManager] Registered provider: ${name}`);
    }
  }

  /**
   * Register multiple providers at once
   * 
   * @param providers - Array of provider instances to register
   */
  registerProviders(providers: AIProvider[]): void {
    providers.forEach(provider => this.registerProvider(provider));
  }

  /**
   * Make a call to the specified provider
   * 
   * @param providerName - Name of the provider to use
   * @param model - The model to use
   * @param messages - Array of messages
   * @param config - Configuration options
   * @returns Promise resolving to the AI response
   */
  async call(
    providerName: ProviderName, 
    model: string, 
    messages: any[], 
    config: AIProviderConfig
  ): Promise<AIProviderResponse> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }

    if (this.debug) {
      console.log(`🤖 [AIProviderManager] Making call to ${providerName} with model: ${model}`);
      console.log(`🤖 [AIProviderManager] Messages count: ${messages.length}`);
      console.log(`🤖 [AIProviderManager] Config: ${JSON.stringify(config)}`);
    }

    try {
      const response = await provider.call(model, messages, config);
      
      if (this.debug) {
        console.log(`🤖 [AIProviderManager] Call to ${providerName} successful`);
      }
      
      return response;
    } catch (error) {
      console.error(`🤖 [AIProviderManager] Error calling ${providerName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a provider is registered
   * 
   * @param providerName - Name of the provider to check
   * @returns True if the provider is registered
   */
  hasProvider(providerName: ProviderName): boolean {
    return this.providers.has(providerName);
  }

  /**
   * Get a list of all registered providers
   * 
   * @returns Array of provider names
   */
  getRegisteredProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get a specific provider instance
   * 
   * @param providerName - Name of the provider to get
   * @returns The provider instance or undefined if not found
   */
  getProvider(providerName: ProviderName): AIProvider | undefined {
    return this.providers.get(providerName);
  }

  /**
   * Remove a provider from the manager
   * 
   * @param providerName - Name of the provider to remove
   * @returns True if the provider was removed, false if it wasn't found
   */
  removeProvider(providerName: ProviderName): boolean {
    const removed = this.providers.delete(providerName);
    
    if (this.debug && removed) {
      console.log(`🤖 [AIProviderManager] Removed provider: ${providerName}`);
    }
    
    return removed;
  }

  /**
   * Clear all registered providers
   */
  clearProviders(): void {
    this.providers.clear();
    
    if (this.debug) {
      console.log(`🤖 [AIProviderManager] Cleared all providers`);
    }
  }
}
