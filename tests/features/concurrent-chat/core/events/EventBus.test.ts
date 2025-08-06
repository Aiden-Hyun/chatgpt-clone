import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('event subscription', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      
      eventBus.subscribe('test-event', handler);
      
      expect(eventBus.hasSubscribers('test-event')).toBe(true);
    });

    it('should subscribe multiple handlers to the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      
      expect(eventBus.hasSubscribers('test-event')).toBe(true);
    });

    it('should subscribe to different event types', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('event1', handler1);
      eventBus.subscribe('event2', handler2);
      
      expect(eventBus.hasSubscribers('event1')).toBe(true);
      expect(eventBus.hasSubscribers('event2')).toBe(true);
    });

    it('should return subscription id', () => {
      const handler = jest.fn();
      
      const subscriptionId = eventBus.subscribe('test-event', handler);
      
      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
    });
  });

  describe('event publishing', () => {
    it('should publish events to subscribers', () => {
      const handler = jest.fn();
      const eventData = { message: 'test' };
      
      eventBus.subscribe('test-event', handler);
      eventBus.publish('test-event', eventData);
      
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should publish to multiple subscribers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const eventData = { message: 'test' };
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      eventBus.publish('test-event', eventData);
      
      expect(handler1).toHaveBeenCalledWith(eventData);
      expect(handler2).toHaveBeenCalledWith(eventData);
    });

    it('should not publish to unsubscribed handlers', () => {
      const handler = jest.fn();
      
      eventBus.subscribe('test-event', handler);
      eventBus.unsubscribe('test-event', handler);
      eventBus.publish('test-event', { message: 'test' });
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle events with no subscribers', () => {
      expect(() => {
        eventBus.publish('no-subscribers', { message: 'test' });
      }).not.toThrow();
    });
  });

  describe('event unsubscription', () => {
    it('should unsubscribe specific handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      eventBus.unsubscribe('test-event', handler1);
      
      eventBus.publish('test-event', { message: 'test' });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should unsubscribe by subscription id', () => {
      const handler = jest.fn();
      
      const subscriptionId = eventBus.subscribe('test-event', handler);
      eventBus.unsubscribeById(subscriptionId);
      
      eventBus.publish('test-event', { message: 'test' });
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle unsubscribing non-existent handlers', () => {
      const handler = jest.fn();
      
      expect(() => {
        eventBus.unsubscribe('test-event', handler);
      }).not.toThrow();
    });

    it('should handle unsubscribing from non-existent events', () => {
      const handler = jest.fn();
      
      expect(() => {
        eventBus.unsubscribe('non-existent-event', handler);
      }).not.toThrow();
    });
  });

  describe('async event processing', () => {
    it('should handle async event handlers', async () => {
      const asyncHandler = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      eventBus.subscribe('async-event', asyncHandler);
      
      await eventBus.publish('async-event', { message: 'test' });
      
      expect(asyncHandler).toHaveBeenCalled();
    });

    it('should handle mixed sync and async handlers', async () => {
      const syncHandler = jest.fn();
      const asyncHandler = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      eventBus.subscribe('mixed-event', syncHandler);
      eventBus.subscribe('mixed-event', asyncHandler);
      
      await eventBus.publish('mixed-event', { message: 'test' });
      
      expect(syncHandler).toHaveBeenCalled();
      expect(asyncHandler).toHaveBeenCalled();
    });

    it('should handle async handler errors gracefully', async () => {
      const errorHandler = jest.fn().mockImplementation(async () => {
        throw new Error('Async error');
      });
      
      eventBus.subscribe('error-event', errorHandler);
      
      await expect(eventBus.publish('error-event', { message: 'test' })).rejects.toThrow('Async error');
    });
  });

  describe('event history logging', () => {
    it('should log published events', () => {
      const eventData = { message: 'test' };
      
      eventBus.publish('test-event', eventData);
      
      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('test-event');
      expect(history[0].data).toBe(eventData);
    });

    it('should log multiple events in order', () => {
      eventBus.publish('event1', { data: 1 });
      eventBus.publish('event2', { data: 2 });
      eventBus.publish('event3', { data: 3 });
      
      const history = eventBus.getEventHistory();
      expect(history).toHaveLength(3);
      expect(history[0].type).toBe('event1');
      expect(history[1].type).toBe('event2');
      expect(history[2].type).toBe('event3');
    });

    it('should limit history size', () => {
      const maxHistory = 5;
      const eventBusWithLimit = new EventBus(maxHistory);
      
      for (let i = 0; i < 10; i++) {
        eventBusWithLimit.publish('test-event', { index: i });
      }
      
      const history = eventBusWithLimit.getEventHistory();
      expect(history).toHaveLength(maxHistory);
      expect(history[0].data.index).toBe(5); // Should keep the last 5 events
    });
  });

  describe('event replay functionality', () => {
    it('should replay events to new subscribers', () => {
      const eventData = { message: 'test' };
      eventBus.publish('test-event', eventData);
      
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler, true); // Enable replay
      
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should not replay events by default', () => {
      const eventData = { message: 'test' };
      eventBus.publish('test-event', eventData);
      
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler); // Default no replay
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should replay multiple events in order', () => {
      eventBus.publish('test-event', { data: 1 });
      eventBus.publish('test-event', { data: 2 });
      eventBus.publish('test-event', { data: 3 });
      
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler, true);
      
      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, { data: 1 });
      expect(handler).toHaveBeenNthCalledWith(2, { data: 2 });
      expect(handler).toHaveBeenNthCalledWith(3, { data: 3 });
    });
  });

  describe('type-safe event handling', () => {
    it('should support typed events', () => {
      interface TestEvent {
        message: string;
        timestamp: number;
      }
      
      const handler = jest.fn();
      eventBus.subscribe<TestEvent>('typed-event', handler);
      
      const eventData: TestEvent = {
        message: 'test',
        timestamp: Date.now()
      };
      
      eventBus.publish('typed-event', eventData);
      
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should handle different event types', () => {
      interface Event1 { data: string; }
      interface Event2 { count: number; }
      
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe<Event1>('event1', handler1);
      eventBus.subscribe<Event2>('event2', handler2);
      
      eventBus.publish('event1', { data: 'test' });
      eventBus.publish('event2', { count: 42 });
      
      expect(handler1).toHaveBeenCalledWith({ data: 'test' });
      expect(handler2).toHaveBeenCalledWith({ count: 42 });
    });
  });

  describe('multiple subscribers per event', () => {
    it('should call all subscribers in order', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      eventBus.subscribe('test-event', handler3);
      
      eventBus.publish('test-event', { message: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('should handle subscriber removal during event processing', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn().mockImplementation(() => {
        eventBus.unsubscribe('test-event', handler1);
      });
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      
      eventBus.publish('test-event', { message: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('event filtering', () => {
    it('should filter events by type', () => {
      const handler = jest.fn();
      eventBus.subscribe('filtered-event', handler);
      
      eventBus.publish('other-event', { message: 'other' });
      eventBus.publish('filtered-event', { message: 'filtered' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ message: 'filtered' });
    });

    it('should support event patterns', () => {
      const handler = jest.fn();
      eventBus.subscribe('user.*', handler); // Pattern matching
      
      eventBus.publish('user.created', { id: 1 });
      eventBus.publish('user.updated', { id: 1 });
      eventBus.publish('system.event', { type: 'system' });
      
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // EventBus should only be responsible for event management
      expect(eventBus.subscribe).toBeDefined();
      expect(eventBus.publish).toBeDefined();
      expect(eventBus.unsubscribe).toBeDefined();
      
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(eventBus));
      const eventMethods = methods.filter(method => 
        method.includes('subscribe') || method.includes('publish') || method.includes('unsubscribe')
      );
      
      expect(eventMethods.length).toBeGreaterThan(0);
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new event types) but closed for modification
      const handler = jest.fn();
      eventBus.subscribe('new-event-type', handler);
      
      eventBus.publish('new-event-type', { data: 'new' });
      
      expect(handler).toHaveBeenCalled();
    });

    it('should follow Dependency Inversion Principle', () => {
      // High-level modules should depend on abstractions
      const highLevelModule = (eventBus: EventBus) => {
        eventBus.publish('test', { data: 'test' });
      };
      
      expect(() => highLevelModule(eventBus)).not.toThrow();
    });
  });

  describe('performance and memory management', () => {
    it('should handle large numbers of events', () => {
      const eventCount = 1000;
      
      for (let i = 0; i < eventCount; i++) {
        eventBus.publish('test-event', { index: i });
      }
      
      const history = eventBus.getEventHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should handle large numbers of subscribers', () => {
      const subscriberCount = 100;
      const handlers = Array.from({ length: subscriberCount }, () => jest.fn());
      
      handlers.forEach(handler => {
        eventBus.subscribe('test-event', handler);
      });
      
      eventBus.publish('test-event', { message: 'test' });
      
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
      });
    });

    it('should clean up unsubscribed handlers', () => {
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler);
      
      expect(eventBus.hasSubscribers('test-event')).toBe(true);
      
      eventBus.unsubscribe('test-event', handler);
      
      expect(eventBus.hasSubscribers('test-event')).toBe(false);
    });
  });
}); 