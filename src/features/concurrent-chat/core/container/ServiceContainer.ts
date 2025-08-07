/**
 * Service Container for dependency injection in the concurrent chat system.
 * Follows SOLID principles with single responsibility for dependency management.
 * 
 * This container provides a centralized way to register and retrieve services,
 * supporting both direct service registration and factory-based lazy loading.
 */
export class ServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  private instances = new Map<string, any>();

  /**
   * Register a service directly with the container.
   * 
   * @param key - The service identifier
   * @param service - The service instance to register
   */
  register(key: string, service: any): void {
    if (!key) {
      throw new Error('Service key cannot be empty');
    }
    
    this.services.set(key, service);
    // Clear any cached instance for this key
    this.instances.delete(key);
  }

  /**
   * Register a factory function that creates services on demand.
   * 
   * @param key - The service identifier
   * @param factory - The factory function that creates the service
   */
  registerFactory(key: string, factory: () => any): void {
    if (!key) {
      throw new Error('Service key cannot be empty');
    }
    
    if (typeof factory !== 'function') {
      throw new Error('Factory must be a function');
    }
    
    this.factories.set(key, factory);
    // Clear any cached instance for this key
    this.instances.delete(key);
  }

  /**
   * Retrieve a service from the container.
   * 
   * @param key - The service identifier
   * @returns The service instance
   * @throws Error if service is not found
   */
  get<T = any>(key: string): T {
    if (!key) {
      throw new Error(`Service ${key} not found`);
    }

    // Check if we have a cached instance
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    // Check if we have a directly registered service
    if (this.services.has(key)) {
      const service = this.services.get(key);
      this.instances.set(key, service);
      return service;
    }

    // Check if we have a factory
    if (this.factories.has(key)) {
      try {
        const factory = this.factories.get(key)!;
        const instance = factory();
        this.instances.set(key, instance);
        return instance;
      } catch (error) {
        throw error;
      }
    }

    // Service not found
    throw new Error(`Service ${key} not found`);
  }

  /**
   * Check if a service is registered.
   * 
   * @param key - The service identifier
   * @returns True if the service is registered
   */
  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key);
  }

  /**
   * Remove a service from the container.
   * 
   * @param key - The service identifier
   */
  remove(key: string): void {
    this.services.delete(key);
    this.factories.delete(key);
    this.instances.delete(key);
  }

  /**
   * Clear all services from the container.
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
    this.instances.clear();
  }

  /**
   * Get all registered service keys.
   * 
   * @returns Array of service keys
   */
  getKeys(): string[] {
    const keys = new Set<string>();
    
    for (const key of this.services.keys()) {
      keys.add(key);
    }
    
    for (const key of this.factories.keys()) {
      keys.add(key);
    }
    
    return Array.from(keys);
  }
} 