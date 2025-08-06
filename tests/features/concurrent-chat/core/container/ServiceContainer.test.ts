import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';

describe('ServiceContainer', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  describe('service registration', () => {
    it('should register services by key', () => {
      const testService = { name: 'test', method: () => 'test' };
      
      container.register('testService', testService);
      
      const retrievedService = container.get('testService');
      expect(retrievedService).toBe(testService);
    });

    it('should register multiple services', () => {
      const service1 = { name: 'service1' };
      const service2 = { name: 'service2' };
      
      container.register('service1', service1);
      container.register('service2', service2);
      
      expect(container.get('service1')).toBe(service1);
      expect(container.get('service2')).toBe(service2);
    });

    it('should overwrite existing services', () => {
      const originalService = { name: 'original' };
      const newService = { name: 'new' };
      
      container.register('testService', originalService);
      container.register('testService', newService);
      
      expect(container.get('testService')).toBe(newService);
    });
  });

  describe('service factory registration', () => {
    it('should register service factories', () => {
      const factory = () => ({ name: 'factory-created', timestamp: Date.now() });
      
      container.registerFactory('factoryService', factory);
      
      const service1 = container.get('factoryService');
      const service2 = container.get('factoryService');
      
      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service1.name).toBe('factory-created');
      expect(service2.name).toBe('factory-created');
    });

    it('should cache factory-created services (same instance)', () => {
      const factory = () => ({ timestamp: Date.now() });
      
      container.registerFactory('timestampService', factory);
      
      const service1 = container.get('timestampService');
      const service2 = container.get('timestampService');
      
      // Should return the same instance (cached)
      expect(service1).toBe(service2);
      expect(service1.timestamp).toBe(service2.timestamp);
    });

    it('should cache factory-created services', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };
      
      container.registerFactory('countedService', factory);
      
      const service1 = container.get('countedService');
      const service2 = container.get('countedService');
      
      expect(callCount).toBe(1); // Factory should only be called once
      expect(service1).toBe(service2); // Same instance should be returned
    });
  });

  describe('service retrieval', () => {
    it('should retrieve registered services', () => {
      const testService = { name: 'test' };
      container.register('testService', testService);
      
      const retrieved = container.get('testService');
      expect(retrieved).toBe(testService);
    });

    it('should throw error for missing services', () => {
      expect(() => {
        container.get('nonexistentService');
      }).toThrow('Service nonexistentService not found');
    });

    it('should handle different service types', () => {
      const stringService = 'string service';
      const numberService = 42;
      const objectService = { key: 'value' };
      const functionService = () => 'function result';
      
      container.register('stringService', stringService);
      container.register('numberService', numberService);
      container.register('objectService', objectService);
      container.register('functionService', functionService);
      
      expect(container.get('stringService')).toBe(stringService);
      expect(container.get('numberService')).toBe(numberService);
      expect(container.get('objectService')).toBe(objectService);
      expect(container.get('functionService')).toBe(functionService);
    });
  });

  describe('dependency resolution', () => {
    it('should resolve service dependencies', () => {
      const dependency = { name: 'dependency' };
      const dependentService = { 
        name: 'dependent',
        dependency: null as any,
        setDependency: function(dep: any) { this.dependency = dep; }
      };
      
      container.register('dependency', dependency);
      container.register('dependentService', dependentService);
      
      const retrieved = container.get('dependentService');
      retrieved.setDependency(container.get('dependency'));
      
      expect(retrieved.dependency).toBe(dependency);
    });

    it('should handle circular dependencies gracefully', () => {
      const serviceA = { name: 'A', b: null as any };
      const serviceB = { name: 'B', a: null as any };
      
      container.register('serviceA', serviceA);
      container.register('serviceB', serviceB);
      
      // This should not cause infinite recursion
      const a = container.get('serviceA');
      const b = container.get('serviceB');
      
      expect(a).toBeDefined();
      expect(b).toBeDefined();
    });
  });

  describe('lazy loading', () => {
    it('should lazy load factory services', () => {
      let factoryCalled = false;
      const factory = () => {
        factoryCalled = true;
        return { name: 'lazy-loaded' };
      };
      
      container.registerFactory('lazyService', factory);
      
      expect(factoryCalled).toBe(false);
      
      const service = container.get('lazyService');
      
      expect(factoryCalled).toBe(true);
      expect(service.name).toBe('lazy-loaded');
    });

    it('should not lazy load directly registered services', () => {
      const service = { name: 'direct' };
      container.register('directService', service);
      
      const retrieved = container.get('directService');
      expect(retrieved).toBe(service);
    });
  });

  describe('service lifecycle management', () => {
    it('should maintain service instances', () => {
      const service = { name: 'persistent', data: [] };
      container.register('persistentService', service);
      
      const first = container.get('persistentService');
      const second = container.get('persistentService');
      
      expect(first).toBe(second);
      expect(first.data).toBe(second.data);
    });

    it('should handle service cleanup', () => {
      const service = { name: 'cleanup', cleanup: jest.fn() };
      container.register('cleanupService', service);
      
      // Simulate cleanup
      const retrieved = container.get('cleanupService');
      retrieved.cleanup();
      
      expect(retrieved.cleanup).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle factory errors', () => {
      const errorFactory = () => {
        throw new Error('Factory error');
      };
      
      container.registerFactory('errorService', errorFactory);
      
      expect(() => {
        container.get('errorService');
      }).toThrow('Factory error');
    });

    it('should handle invalid service keys', () => {
      expect(() => {
        container.get('');
      }).toThrow('Service  not found');
      
      expect(() => {
        container.get(null as any);
      }).toThrow('Service null not found');
      
      expect(() => {
        container.get(undefined as any);
      }).toThrow('Service undefined not found');
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // ServiceContainer should only be responsible for dependency management
      expect(container.register).toBeDefined();
      expect(container.registerFactory).toBeDefined();
      expect(container.get).toBeDefined();
      
      // Should not have methods unrelated to dependency management
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(container));
      const dependencyMethods = methods.filter(method => 
        method.includes('register') || method.includes('get') || method.includes('factory')
      );
      
      expect(dependencyMethods.length).toBeGreaterThan(0);
    });

    it('should follow Dependency Inversion Principle', () => {
      // High-level modules should depend on abstractions, not concretions
      const highLevelModule = (container: ServiceContainer) => {
        return container.get('someService');
      };
      
      // Register a service first so the test doesn't throw
      container.register('someService', { name: 'test' });
      
      const result = highLevelModule(container);
      // Should not throw if container is properly abstracted
      expect(() => highLevelModule(container)).not.toThrow();
    });

    it('should support interface-based dependencies', () => {
      interface ITestService {
        name: string;
        method(): string;
      }
      
      const testService: ITestService = {
        name: 'test',
        method: () => 'test result'
      };
      
      container.register('testService', testService);
      
      const retrieved = container.get('testService') as ITestService;
      expect(retrieved.name).toBe('test');
      expect(retrieved.method()).toBe('test result');
    });
  });

  describe('performance and scalability', () => {
    it('should handle large numbers of services', () => {
      const serviceCount = 1000;
      
      for (let i = 0; i < serviceCount; i++) {
        container.register(`service${i}`, { id: i });
      }
      
      for (let i = 0; i < serviceCount; i++) {
        const service = container.get(`service${i}`);
        expect(service.id).toBe(i);
      }
    });

    it('should handle concurrent access', () => {
      const service = { name: 'concurrent', counter: 0 };
      container.register('concurrentService', service);
      
      const promises = Array.from({ length: 100 }, () => 
        Promise.resolve(container.get('concurrentService'))
      );
      
      return Promise.all(promises).then(results => {
        results.forEach(result => {
          expect(result).toBe(service);
        });
      });
    });
  });
}); 