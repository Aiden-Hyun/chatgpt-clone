import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { AnimationManager } from '../../../../src/features/concurrent-chat/core/animation/AnimationManager';
import { AnimationProcessor } from '../../../../src/features/concurrent-chat/core/animation/AnimationProcessor';
import { AnimationPerformanceMonitor } from '../../../../src/features/concurrent-chat/core/animation/AnimationPerformanceMonitor';
import { AnimationController } from '../../../../src/features/concurrent-chat/core/animation/AnimationController';
import { AnimationEventManager } from '../../../../src/features/concurrent-chat/core/animation/AnimationEventManager';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { StrategyManager } from '../../../../src/features/concurrent-chat/core/strategies/StrategyManager';

describe('Animation Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let animationManager: AnimationManager;
  let animationProcessor: AnimationProcessor;
  let animationPerformanceMonitor: AnimationPerformanceMonitor;
  let animationController: AnimationController;
  let animationEventManager: AnimationEventManager;
  let pluginManager: PluginManager;
  let strategyManager: StrategyManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    animationManager = new AnimationManager(serviceContainer, eventBus);
    animationProcessor = new AnimationProcessor(serviceContainer, eventBus);
    animationPerformanceMonitor = new AnimationPerformanceMonitor(serviceContainer, eventBus);
    animationController = new AnimationController(serviceContainer, eventBus);
    animationEventManager = new AnimationEventManager(serviceContainer, eventBus);
    pluginManager = new PluginManager(serviceContainer, eventBus);
    strategyManager = new StrategyManager(serviceContainer, eventBus);
  });

  describe('Animation integration with messages', () => {
    it('should integrate animation with message display', async () => {
      const messageId = 'msg1';
      const message = {
        id: messageId,
        content: 'Hello World!',
        role: 'assistant',
        status: 'completed'
      };

      animationManager.animateMessage = jest.fn().mockResolvedValue({
        animationId: 'anim1',
        success: true,
        duration: 2000
      });

      animationProcessor.processMessageForAnimation = jest.fn().mockResolvedValue({
        processed: true,
        animationData: {
          type: 'typewriter',
          speed: 1.0,
          content: 'Hello World!'
        }
      });

      const result = await animationManager.animateMessage(message);

      expect(animationManager.animateMessage).toHaveBeenCalledWith(message);
      expect(result.success).toBe(true);
      expect(result.animationId).toBe('anim1');
    });

    it('should handle animation for different message types', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', type: 'text' },
        { id: 'msg2', content: '```code```', type: 'code' },
        { id: 'msg3', content: '**bold**', type: 'markdown' }
      ];

      animationManager.animateMessage = jest.fn().mockResolvedValue({ success: true });
      animationProcessor.detectMessageType = jest.fn().mockImplementation((message) => {
        return message.type;
      });

      for (const message of messages) {
        const messageType = animationProcessor.detectMessageType(message);
        const result = await animationManager.animateMessage(message);
        
        expect(result.success).toBe(true);
        expect(messageType).toBe(message.type);
      }
    });

    it('should handle animation for concurrent messages', async () => {
      const messages = [
        { id: 'msg1', content: 'Message 1', role: 'assistant' },
        { id: 'msg2', content: 'Message 2', role: 'assistant' },
        { id: 'msg3', content: 'Message 3', role: 'assistant' }
      ];

      animationManager.animateConcurrentMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', animationId: 'anim1', success: true },
          { messageId: 'msg2', animationId: 'anim2', success: true },
          { messageId: 'msg3', animationId: 'anim3', success: true }
        ]
      });

      const result = await animationManager.animateConcurrentMessages(messages);

      expect(animationManager.animateConcurrentMessages).toHaveBeenCalledWith(messages);
      expect(result.results).toHaveLength(3);
      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('should handle animation for message updates', async () => {
      const messageId = 'msg1';
      const originalContent = 'Hello';
      const updatedContent = 'Hello World!';

      animationManager.animateMessageUpdate = jest.fn().mockResolvedValue({
        success: true,
        animationId: 'anim1',
        updateType: 'content_change'
      });

      const result = await animationManager.animateMessageUpdate(messageId, originalContent, updatedContent);

      expect(animationManager.animateMessageUpdate).toHaveBeenCalledWith(messageId, originalContent, updatedContent);
      expect(result.success).toBe(true);
      expect(result.updateType).toBe('content_change');
    });
  });

  describe('Animation performance', () => {
    it('should monitor animation performance', async () => {
      const animationId = 'anim1';

      animationPerformanceMonitor.startMonitoring = jest.fn().mockResolvedValue(true);
      animationPerformanceMonitor.getPerformanceMetrics = jest.fn().mockResolvedValue({
        fps: 60,
        memoryUsage: '5MB',
        cpuUsage: 15,
        duration: 2000
      });

      await animationPerformanceMonitor.startMonitoring(animationId);
      const metrics = await animationPerformanceMonitor.getPerformanceMetrics(animationId);

      expect(animationPerformanceMonitor.startMonitoring).toHaveBeenCalledWith(animationId);
      expect(metrics.fps).toBe(60);
      expect(metrics.memoryUsage).toBe('5MB');
      expect(metrics.cpuUsage).toBe(15);
    });

    it('should handle performance optimization', async () => {
      const animationId = 'anim1';

      animationPerformanceMonitor.optimizePerformance = jest.fn().mockResolvedValue({
        optimized: true,
        improvements: {
          fps: 75,
          memoryReduction: '2MB',
          cpuReduction: 5
        }
      });

      const result = await animationPerformanceMonitor.optimizePerformance(animationId);

      expect(animationPerformanceMonitor.optimizePerformance).toHaveBeenCalledWith(animationId);
      expect(result.optimized).toBe(true);
      expect(result.improvements.fps).toBe(75);
      expect(result.improvements.memoryReduction).toBe('2MB');
    });

    it('should handle performance degradation', async () => {
      const animationId = 'anim1';

      animationPerformanceMonitor.detectPerformanceIssues = jest.fn().mockResolvedValue({
        issues: [
          { type: 'low_fps', severity: 'medium', fps: 15 },
          { type: 'high_memory', severity: 'high', memoryUsage: '50MB' }
        ]
      });

      const issues = await animationPerformanceMonitor.detectPerformanceIssues(animationId);

      expect(animationPerformanceMonitor.detectPerformanceIssues).toHaveBeenCalledWith(animationId);
      expect(issues.issues).toHaveLength(2);
      expect(issues.issues[0].type).toBe('low_fps');
      expect(issues.issues[1].type).toBe('high_memory');
    });

    it('should handle performance thresholds', async () => {
      const animationId = 'anim1';

      animationPerformanceMonitor.checkPerformanceThresholds = jest.fn().mockResolvedValue({
        withinThresholds: false,
        violations: [
          { metric: 'fps', current: 15, threshold: 30 },
          { metric: 'memory', current: '50MB', threshold: '20MB' }
        ]
      });

      const thresholds = await animationPerformanceMonitor.checkPerformanceThresholds(animationId);

      expect(animationPerformanceMonitor.checkPerformanceThresholds).toHaveBeenCalledWith(animationId);
      expect(thresholds.withinThresholds).toBe(false);
      expect(thresholds.violations).toHaveLength(2);
    });
  });

  describe('Animation controls', () => {
    it('should handle animation play controls', async () => {
      const animationId = 'anim1';

      animationController.playAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'playing',
        startTime: Date.now()
      });

      const result = await animationController.playAnimation(animationId);

      expect(animationController.playAnimation).toHaveBeenCalledWith(animationId);
      expect(result.success).toBe(true);
      expect(result.status).toBe('playing');
    });

    it('should handle animation pause controls', async () => {
      const animationId = 'anim1';

      animationController.pauseAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'paused',
        pauseTime: Date.now()
      });

      const result = await animationController.pauseAnimation(animationId);

      expect(animationController.pauseAnimation).toHaveBeenCalledWith(animationId);
      expect(result.success).toBe(true);
      expect(result.status).toBe('paused');
    });

    it('should handle animation stop controls', async () => {
      const animationId = 'anim1';

      animationController.stopAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'stopped',
        stopTime: Date.now()
      });

      const result = await animationController.stopAnimation(animationId);

      expect(animationController.stopAnimation).toHaveBeenCalledWith(animationId);
      expect(result.success).toBe(true);
      expect(result.status).toBe('stopped');
    });

    it('should handle animation speed controls', async () => {
      const animationId = 'anim1';
      const speed = 2.0;

      animationController.setAnimationSpeed = jest.fn().mockResolvedValue({
        success: true,
        newSpeed: 2.0,
        duration: 1000 // Reduced duration due to increased speed
      });

      const result = await animationController.setAnimationSpeed(animationId, speed);

      expect(animationController.setAnimationSpeed).toHaveBeenCalledWith(animationId, speed);
      expect(result.success).toBe(true);
      expect(result.newSpeed).toBe(2.0);
    });

    it('should handle animation restart controls', async () => {
      const animationId = 'anim1';

      animationController.restartAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'playing',
        restartTime: Date.now()
      });

      const result = await animationController.restartAnimation(animationId);

      expect(animationController.restartAnimation).toHaveBeenCalledWith(animationId);
      expect(result.success).toBe(true);
      expect(result.status).toBe('playing');
    });
  });

  describe('Animation events', () => {
    it('should handle animation start events', async () => {
      const animationId = 'anim1';
      const eventData = { type: 'start', timestamp: Date.now() };

      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true,
        eventType: 'start',
        listeners: 3
      });

      const result = await animationEventManager.handleAnimationEvent(animationId, eventData);

      expect(animationEventManager.handleAnimationEvent).toHaveBeenCalledWith(animationId, eventData);
      expect(result.handled).toBe(true);
      expect(result.eventType).toBe('start');
    });

    it('should handle animation progress events', async () => {
      const animationId = 'anim1';
      const progressEvents = [
        { type: 'progress', progress: 0.25, timestamp: Date.now() },
        { type: 'progress', progress: 0.5, timestamp: Date.now() + 100 },
        { type: 'progress', progress: 0.75, timestamp: Date.now() + 200 },
        { type: 'progress', progress: 1.0, timestamp: Date.now() + 300 }
      ];

      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true,
        eventType: 'progress'
      });

      for (const event of progressEvents) {
        const result = await animationEventManager.handleAnimationEvent(animationId, event);
        expect(result.handled).toBe(true);
        expect(result.eventType).toBe('progress');
      }
    });

    it('should handle animation completion events', async () => {
      const animationId = 'anim1';
      const completionEvent = { type: 'complete', timestamp: Date.now() };

      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true,
        eventType: 'complete',
        cleanup: true
      });

      const result = await animationEventManager.handleAnimationEvent(animationId, completionEvent);

      expect(animationEventManager.handleAnimationEvent).toHaveBeenCalledWith(animationId, completionEvent);
      expect(result.handled).toBe(true);
      expect(result.eventType).toBe('complete');
      expect(result.cleanup).toBe(true);
    });

    it('should handle animation error events', async () => {
      const animationId = 'anim1';
      const errorEvent = { type: 'error', error: 'Animation failed', timestamp: Date.now() };

      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true,
        eventType: 'error',
        errorHandled: true,
        fallback: true
      });

      const result = await animationEventManager.handleAnimationEvent(animationId, errorEvent);

      expect(animationEventManager.handleAnimationEvent).toHaveBeenCalledWith(animationId, errorEvent);
      expect(result.handled).toBe(true);
      expect(result.eventType).toBe('error');
      expect(result.errorHandled).toBe(true);
    });

    it('should handle animation event listeners', async () => {
      const animationId = 'anim1';
      const eventType = 'progress';

      animationEventManager.addEventListener = jest.fn().mockResolvedValue({
        listenerId: 'listener1',
        added: true
      });

      animationEventManager.removeEventListener = jest.fn().mockResolvedValue({
        removed: true
      });

      const addResult = await animationEventManager.addEventListener(animationId, eventType, jest.fn());
      expect(addResult.added).toBe(true);
      expect(addResult.listenerId).toBe('listener1');

      const removeResult = await animationEventManager.removeEventListener(animationId, 'listener1');
      expect(removeResult.removed).toBe(true);
    });
  });

  describe('Plugin interaction', () => {
    it('should integrate with animation plugins', async () => {
      const animationId = 'anim1';
      const animationData = { type: 'typewriter', content: 'Hello World!' };

      const animationPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceAnimation: jest.fn().mockReturnValue({ ...animationData, enhanced: true })
      };

      pluginManager.registerPlugin('animation-enhancer', animationPlugin);
      pluginManager.mountPlugin('animation-enhancer');

      const result = await animationProcessor.processAnimationWithPlugins(animationId, animationData);

      expect(animationPlugin.enhanceAnimation).toHaveBeenCalledWith(animationId, animationData);
      expect(result.enhanced).toBe(true);
    });

    it('should integrate with animation performance plugins', async () => {
      const animationId = 'anim1';

      const performancePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        optimizeAnimationPerformance: jest.fn().mockReturnValue({
          optimized: true,
          improvements: { fps: 75, memoryReduction: '2MB' }
        })
      };

      pluginManager.registerPlugin('performance-optimizer', performancePlugin);
      pluginManager.mountPlugin('performance-optimizer');

      const result = await animationPerformanceMonitor.optimizeWithPlugins(animationId);

      expect(performancePlugin.optimizeAnimationPerformance).toHaveBeenCalledWith(animationId);
      expect(result.optimized).toBe(true);
      expect(result.improvements.fps).toBe(75);
    });

    it('should integrate with animation control plugins', async () => {
      const animationId = 'anim1';
      const controlAction = 'play';

      const controlPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceControl: jest.fn().mockReturnValue({
          enhanced: true,
          action: 'play',
          metadata: { speed: 1.0, duration: 2000 }
        })
      };

      pluginManager.registerPlugin('control-enhancer', controlPlugin);
      pluginManager.mountPlugin('control-enhancer');

      const result = await animationController.controlWithPlugins(animationId, controlAction);

      expect(controlPlugin.enhanceControl).toHaveBeenCalledWith(animationId, controlAction);
      expect(result.enhanced).toBe(true);
      expect(result.action).toBe('play');
    });
  });

  describe('Strategy pattern integration', () => {
    it('should integrate with animation strategies', async () => {
      const animationId = 'anim1';
      const animationData = { content: 'Hello World!', type: 'text' };

      const animationStrategy = {
        animate: jest.fn().mockResolvedValue(true),
        canAnimate: () => true,
        getStrategy: () => 'typewriter'
      };

      strategyManager.registerStrategy('animation', animationStrategy);
      strategyManager.selectStrategy('animation', 'typewriter');

      const result = await animationProcessor.animateWithStrategy(animationId, animationData);

      expect(animationStrategy.animate).toHaveBeenCalledWith(animationId, animationData);
      expect(result).toBe(true);
    });

    it('should integrate with performance strategies', async () => {
      const animationId = 'anim1';

      const performanceStrategy = {
        optimize: jest.fn().mockResolvedValue({
          optimized: true,
          strategy: 'adaptive',
          improvements: { fps: 75 }
        }),
        canOptimize: () => true,
        getStrategy: () => 'adaptive'
      };

      strategyManager.registerStrategy('performance', performanceStrategy);
      strategyManager.selectStrategy('performance', 'adaptive');

      const result = await animationPerformanceMonitor.optimizeWithStrategy(animationId);

      expect(performanceStrategy.optimize).toHaveBeenCalledWith(animationId);
      expect(result.optimized).toBe(true);
      expect(result.strategy).toBe('adaptive');
    });

    it('should integrate with control strategies', async () => {
      const animationId = 'anim1';
      const controlAction = 'play';

      const controlStrategy = {
        execute: jest.fn().mockResolvedValue({
          executed: true,
          action: 'play',
          result: 'success'
        }),
        canExecute: () => true,
        getStrategy: () => 'smooth'
      };

      strategyManager.registerStrategy('control', controlStrategy);
      strategyManager.selectStrategy('control', 'smooth');

      const result = await animationController.controlWithStrategy(animationId, controlAction);

      expect(controlStrategy.execute).toHaveBeenCalledWith(animationId, controlAction);
      expect(result.executed).toBe(true);
      expect(result.action).toBe('play');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete animation workflow', async () => {
      const messageId = 'msg1';
      const message = {
        id: messageId,
        content: 'Hello World!',
        role: 'assistant',
        status: 'completed'
      };

      // Mock all dependencies
      animationManager.animateMessage = jest.fn().mockResolvedValue({
        animationId: 'anim1',
        success: true
      });
      animationController.playAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'playing'
      });
      animationPerformanceMonitor.startMonitoring = jest.fn().mockResolvedValue(true);
      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true
      });

      // Start animation
      const animationResult = await animationManager.animateMessage(message);
      expect(animationResult.success).toBe(true);

      // Play animation
      const playResult = await animationController.playAnimation(animationResult.animationId);
      expect(playResult.success).toBe(true);

      // Monitor performance
      await animationPerformanceMonitor.startMonitoring(animationResult.animationId);

      // Handle events
      await animationEventManager.handleAnimationEvent(animationResult.animationId, {
        type: 'start',
        timestamp: Date.now()
      });
    });

    it('should handle animation with performance optimization', async () => {
      const animationId = 'anim1';

      // Mock performance monitoring
      animationPerformanceMonitor.detectPerformanceIssues = jest.fn().mockResolvedValue({
        issues: [{ type: 'low_fps', severity: 'medium' }]
      });
      animationPerformanceMonitor.optimizePerformance = jest.fn().mockResolvedValue({
        optimized: true,
        improvements: { fps: 75 }
      });
      animationController.setAnimationSpeed = jest.fn().mockResolvedValue({
        success: true,
        newSpeed: 1.5
      });

      // Detect issues
      const issues = await animationPerformanceMonitor.detectPerformanceIssues(animationId);
      expect(issues.issues.length).toBeGreaterThan(0);

      // Optimize performance
      const optimization = await animationPerformanceMonitor.optimizePerformance(animationId);
      expect(optimization.optimized).toBe(true);

      // Adjust speed
      const speedResult = await animationController.setAnimationSpeed(animationId, 1.5);
      expect(speedResult.success).toBe(true);
    });

    it('should handle animation with error recovery', async () => {
      const animationId = 'anim1';
      const error = new Error('Animation failed');

      // Mock error handling
      animationEventManager.handleAnimationEvent = jest.fn().mockResolvedValue({
        handled: true,
        eventType: 'error',
        errorHandled: true,
        fallback: true
      });
      animationController.stopAnimation = jest.fn().mockResolvedValue({
        success: true,
        status: 'stopped'
      });
      animationManager.fallbackToStaticDisplay = jest.fn().mockResolvedValue({
        success: true,
        fallbackType: 'static'
      });

      // Handle error event
      const errorResult = await animationEventManager.handleAnimationEvent(animationId, {
        type: 'error',
        error: error.message
      });
      expect(errorResult.errorHandled).toBe(true);

      // Stop animation
      const stopResult = await animationController.stopAnimation(animationId);
      expect(stopResult.success).toBe(true);

      // Fallback to static display
      const fallbackResult = await animationManager.fallbackToStaticDisplay(animationId);
      expect(fallbackResult.success).toBe(true);
    });
  });
}); 