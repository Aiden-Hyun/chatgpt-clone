import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { PluginManager } from '../../../../src/features/concurrent-chat/plugins/PluginManager';

describe('PluginManager - Simple Test', () => {
  let pluginManager: PluginManager;
  let mockEventBus: EventBus;
  let mockServiceContainer: ServiceContainer;

  beforeEach(() => {
    mockEventBus = new EventBus();
    mockServiceContainer = new ServiceContainer();
    pluginManager = new PluginManager(mockEventBus, mockServiceContainer);
  });

  it('should create plugin manager instance', () => {
    expect(pluginManager).toBeInstanceOf(PluginManager);
  });

  it('should have empty plugin registry initially', () => {
    expect(pluginManager.getAllPlugins()).toHaveLength(0);
  });

  it('should return correct plugin statistics', () => {
    const stats = pluginManager.getPluginStats();
    expect(stats.total).toBe(0);
    expect(stats.eventPlugins).toBe(0);
    expect(stats.renderPlugins).toBe(0);
    expect(stats.lifecyclePlugins).toBe(0);
  });
}); 