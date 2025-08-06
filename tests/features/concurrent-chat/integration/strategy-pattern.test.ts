import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { StrategyManager } from '../../../../src/features/concurrent-chat/core/strategies/StrategyManager';
import { IAnimationStrategy } from '../../../../src/features/concurrent-chat/core/interfaces/IAnimationStrategy';
import { IStreamingStrategy } from '../../../../src/features/concurrent-chat/core/interfaces/IStreamingStrategy';
import { IRenderingStrategy } from '../../../../src/features/concurrent-chat/core/interfaces/IRenderingStrategy';
import { TypewriterAnimationStrategy } from '../../../../src/features/concurrent-chat/core/strategies/TypewriterAnimationStrategy';
import { FadeInAnimationStrategy } from '../../../../src/features/concurrent-chat/core/strategies/FadeInAnimationStrategy';
import { RealTimeStreamingStrategy } from '../../../../src/features/concurrent-chat/core/strategies/RealTimeStreamingStrategy';
import { BufferedStreamingStrategy } from '../../../../src/features/concurrent-chat/core/strategies/BufferedStreamingStrategy';

describe('Strategy Pattern Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let strategyManager: StrategyManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    strategyManager = new StrategyManager(serviceContainer, eventBus);
  });

  describe('Strategy selection', () => {
    it('should select animation strategies correctly', () => {
      const typewriterStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const fadeInStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('typewriter', typewriterStrategy);
      strategyManager.registerStrategy('fade-in', fadeInStrategy);

      strategyManager.selectStrategy('animation', 'typewriter');
      const selectedStrategy = strategyManager.getCurrentStrategy('animation');

      expect(selectedStrategy).toBe(typewriterStrategy);
    });

    it('should select streaming strategies correctly', () => {
      const realTimeStrategy: IStreamingStrategy = {
        stream: jest.fn(),
        canStream: () => true,
        getBufferSize: () => 0
      };

      const bufferedStrategy: IStreamingStrategy = {
        stream: jest.fn(),
        canStream: () => true,
        getBufferSize: () => 1024
      };

      strategyManager.registerStrategy('real-time', realTimeStrategy);
      strategyManager.registerStrategy('buffered', bufferedStrategy);

      strategyManager.selectStrategy('streaming', 'real-time');
      const selectedStrategy = strategyManager.getCurrentStrategy('streaming');

      expect(selectedStrategy).toBe(realTimeStrategy);
    });

    it('should select rendering strategies correctly', () => {
      const markdownStrategy: IRenderingStrategy = {
        render: jest.fn(),
        canRender: () => true,
        getSupportedFormats: () => ['markdown']
      };

      const htmlStrategy: IRenderingStrategy = {
        render: jest.fn(),
        canRender: () => true,
        getSupportedFormats: () => ['html']
      };

      strategyManager.registerStrategy('markdown', markdownStrategy);
      strategyManager.registerStrategy('html', htmlStrategy);

      strategyManager.selectStrategy('rendering', 'markdown');
      const selectedStrategy = strategyManager.getCurrentStrategy('rendering');

      expect(selectedStrategy).toBe(markdownStrategy);
    });

    it('should handle strategy selection errors', () => {
      expect(() => {
        strategyManager.selectStrategy('animation', 'non-existent');
      }).toThrow('Strategy not found: non-existent');
    });

    it('should validate strategy compatibility', () => {
      const incompatibleStrategy = {
        render: jest.fn() // Not an animation strategy
      };

      strategyManager.registerStrategy('incompatible', incompatibleStrategy);

      expect(() => {
        strategyManager.selectStrategy('animation', 'incompatible');
      }).toThrow('Incompatible strategy type');
    });
  });

  describe('Strategy substitution', () => {
    it('should substitute animation strategies', () => {
      const originalStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const substituteStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('original', originalStrategy);
      strategyManager.selectStrategy('animation', 'original');

      strategyManager.substituteStrategy('original', substituteStrategy);
      const currentStrategy = strategyManager.getCurrentStrategy('animation');

      expect(currentStrategy).toBe(substituteStrategy);
    });

    it('should substitute streaming strategies', () => {
      const originalStrategy: IStreamingStrategy = {
        stream: jest.fn(),
        canStream: () => true,
        getBufferSize: () => 0
      };

      const substituteStrategy: IStreamingStrategy = {
        stream: jest.fn(),
        canStream: () => true,
        getBufferSize: () => 1024
      };

      strategyManager.registerStrategy('original-streaming', originalStrategy);
      strategyManager.selectStrategy('streaming', 'original-streaming');

      strategyManager.substituteStrategy('original-streaming', substituteStrategy);
      const currentStrategy = strategyManager.getCurrentStrategy('streaming');

      expect(currentStrategy).toBe(substituteStrategy);
    });

    it('should maintain strategy interface during substitution', () => {
      const originalStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const substituteStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('interface-test', originalStrategy);
      strategyManager.substituteStrategy('interface-test', substituteStrategy);

      const registeredStrategy = strategyManager.getStrategy('interface-test');
      expect(registeredStrategy.animate).toBeDefined();
      expect(registeredStrategy.canAnimate).toBeDefined();
      expect(registeredStrategy.getDuration).toBeDefined();
    });

    it('should handle substitution errors gracefully', () => {
      const originalStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const invalidSubstitute = null; // Invalid strategy

      strategyManager.registerStrategy('error-substitute', originalStrategy);

      expect(() => {
        strategyManager.substituteStrategy('error-substitute', invalidSubstitute);
      }).toThrow('Invalid strategy for substitution');
    });
  });

  describe('Runtime strategy changes', () => {
    it('should change strategies at runtime', () => {
      const strategy1: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const strategy2: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('runtime1', strategy1);
      strategyManager.registerStrategy('runtime2', strategy2);

      strategyManager.selectStrategy('animation', 'runtime1');
      expect(strategyManager.getCurrentStrategy('animation')).toBe(strategy1);

      strategyManager.selectStrategy('animation', 'runtime2');
      expect(strategyManager.getCurrentStrategy('animation')).toBe(strategy2);
    });

    it('should handle runtime strategy changes with state preservation', () => {
      const strategy1: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const strategy2: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('state1', strategy1);
      strategyManager.registerStrategy('state2', strategy2);

      // Set some state
      strategyManager.setStrategyState('animation', { progress: 0.5 });

      strategyManager.selectStrategy('animation', 'state1');
      strategyManager.selectStrategy('animation', 'state2');

      const preservedState = strategyManager.getStrategyState('animation');
      expect(preservedState).toEqual({ progress: 0.5 });
    });

    it('should notify strategy change events', () => {
      const mockListener = jest.fn();
      eventBus.subscribe('strategy:changed', mockListener);

      const strategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      strategyManager.registerStrategy('notify-test', strategy);
      strategyManager.selectStrategy('animation', 'notify-test');

      expect(mockListener).toHaveBeenCalledWith({
        type: 'animation',
        strategyName: 'notify-test'
      });
    });

    it('should handle concurrent strategy changes', () => {
      const strategy1: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const strategy2: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('concurrent1', strategy1);
      strategyManager.registerStrategy('concurrent2', strategy2);

      // Simulate concurrent changes
      strategyManager.selectStrategy('animation', 'concurrent1');
      strategyManager.selectStrategy('streaming', 'concurrent2');

      expect(strategyManager.getCurrentStrategy('animation')).toBe(strategy1);
      expect(strategyManager.getCurrentStrategy('streaming')).toBe(strategy2);
    });
  });

  describe('Strategy performance', () => {
    it('should measure strategy performance', () => {
      const fastStrategy: IAnimationStrategy = {
        animate: jest.fn().mockImplementation(() => {
          // Simulate fast execution
          return Promise.resolve();
        }),
        canAnimate: () => true,
        getDuration: () => 100
      };

      const slowStrategy: IAnimationStrategy = {
        animate: jest.fn().mockImplementation(() => {
          // Simulate slow execution
          return new Promise(resolve => setTimeout(resolve, 100));
        }),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      strategyManager.registerStrategy('fast', fastStrategy);
      strategyManager.registerStrategy('slow', slowStrategy);

      const fastPerformance = strategyManager.measureStrategyPerformance('fast');
      const slowPerformance = strategyManager.measureStrategyPerformance('slow');

      expect(fastPerformance.executionTime).toBeLessThan(slowPerformance.executionTime);
    });

    it('should optimize strategy selection based on performance', () => {
      const strategy1: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const strategy2: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 500
      };

      strategyManager.registerStrategy('optimize1', strategy1);
      strategyManager.registerStrategy('optimize2', strategy2);

      const optimalStrategy = strategyManager.getOptimalStrategy('animation', 'performance');
      expect(optimalStrategy).toBe(strategy2); // Faster strategy
    });

    it('should handle strategy performance monitoring', () => {
      const monitoredStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      strategyManager.registerStrategy('monitored', monitoredStrategy);
      strategyManager.enablePerformanceMonitoring('monitored');

      strategyManager.selectStrategy('animation', 'monitored');
      const performanceMetrics = strategyManager.getPerformanceMetrics('monitored');

      expect(performanceMetrics).toBeDefined();
      expect(performanceMetrics.executionCount).toBe(0);
    });

    it('should handle strategy performance degradation', () => {
      const degradingStrategy: IAnimationStrategy = {
        animate: jest.fn().mockImplementation(() => {
          // Simulate performance degradation
          const startTime = Date.now();
          while (Date.now() - startTime < 100) {
            // Busy wait to simulate degradation
          }
          return Promise.resolve();
        }),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      strategyManager.registerStrategy('degrading', degradingStrategy);
      strategyManager.enablePerformanceMonitoring('degrading');

      strategyManager.selectStrategy('animation', 'degrading');
      const performanceMetrics = strategyManager.getPerformanceMetrics('degrading');

      expect(performanceMetrics.averageExecutionTime).toBeGreaterThan(50);
    });
  });

  describe('Strategy configuration', () => {
    it('should configure strategies with parameters', () => {
      const configurableStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const config = {
        speed: 2.0,
        easing: 'ease-in-out',
        quality: 'high'
      };

      strategyManager.registerStrategy('configurable', configurableStrategy);
      strategyManager.configureStrategy('configurable', config);

      const strategyConfig = strategyManager.getStrategyConfiguration('configurable');
      expect(strategyConfig).toEqual(config);
    });

    it('should validate strategy configuration', () => {
      const configurableStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const invalidConfig = {
        speed: -1, // Invalid speed
        quality: 'invalid' // Invalid quality
      };

      strategyManager.registerStrategy('validate-config', configurableStrategy);

      expect(() => {
        strategyManager.configureStrategy('validate-config', invalidConfig);
      }).toThrow('Invalid configuration');
    });

    it('should handle strategy configuration updates', () => {
      const configurableStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const initialConfig = { speed: 1.0 };
      const updatedConfig = { speed: 2.0 };

      strategyManager.registerStrategy('update-config', configurableStrategy);
      strategyManager.configureStrategy('update-config', initialConfig);
      strategyManager.configureStrategy('update-config', updatedConfig);

      const strategyConfig = strategyManager.getStrategyConfiguration('update-config');
      expect(strategyConfig).toEqual(updatedConfig);
    });

    it('should apply configuration to active strategies', () => {
      const configurableStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const config = { speed: 2.0 };

      strategyManager.registerStrategy('active-config', configurableStrategy);
      strategyManager.selectStrategy('animation', 'active-config');
      strategyManager.configureStrategy('active-config', config);

      const activeStrategy = strategyManager.getCurrentStrategy('animation');
      const activeConfig = strategyManager.getStrategyConfiguration('active-config');

      expect(activeConfig).toEqual(config);
    });
  });

  describe('Plugin strategy integration', () => {
    it('should integrate strategies with plugins', () => {
      const pluginStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const plugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        getStrategyEnhancements: jest.fn().mockReturnValue(['plugin-feature'])
      };

      strategyManager.registerStrategy('plugin-integration', pluginStrategy);
      strategyManager.registerPlugin('test-plugin', plugin);

      const enhancedStrategy = strategyManager.getEnhancedStrategy('plugin-integration', 'test-plugin');
      expect(enhancedStrategy).toBeDefined();
    });

    it('should allow plugins to modify strategy behavior', () => {
      const baseStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const modifyingPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyStrategy: jest.fn().mockImplementation((strategy) => {
          return {
            ...strategy,
            getDuration: () => 500 // Modified duration
          };
        })
      };

      strategyManager.registerStrategy('modifiable', baseStrategy);
      strategyManager.registerPlugin('modifier', modifyingPlugin);

      const modifiedStrategy = strategyManager.getEnhancedStrategy('modifiable', 'modifier');
      expect(modifiedStrategy.getDuration()).toBe(500);
    });

    it('should handle plugin strategy conflicts', () => {
      const baseStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const conflictingPlugin1 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyStrategy: jest.fn().mockImplementation((strategy) => {
          return { ...strategy, getDuration: () => 500 };
        })
      };

      const conflictingPlugin2 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyStrategy: jest.fn().mockImplementation((strategy) => {
          return { ...strategy, getDuration: () => 2000 };
        })
      };

      strategyManager.registerStrategy('conflicting', baseStrategy);
      strategyManager.registerPlugin('conflict1', conflictingPlugin1);
      strategyManager.registerPlugin('conflict2', conflictingPlugin2);

      const resolvedStrategy = strategyManager.resolveStrategyConflicts('conflicting', ['conflict1', 'conflict2']);
      expect(resolvedStrategy).toBeDefined();
    });

    it('should support plugin strategy composition', () => {
      const baseStrategy: IAnimationStrategy = {
        animate: jest.fn(),
        canAnimate: () => true,
        getDuration: () => 1000
      };

      const plugin1 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceStrategy: jest.fn().mockImplementation((strategy) => {
          return { ...strategy, feature1: true };
        })
      };

      const plugin2 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceStrategy: jest.fn().mockImplementation((strategy) => {
          return { ...strategy, feature2: true };
        })
      };

      strategyManager.registerStrategy('composable', baseStrategy);
      strategyManager.registerPlugin('composer1', plugin1);
      strategyManager.registerPlugin('composer2', plugin2);

      const composedStrategy = strategyManager.composeStrategyWithPlugins('composable', ['composer1', 'composer2']);
      expect(composedStrategy.feature1).toBe(true);
      expect(composedStrategy.feature2).toBe(true);
    });
  });

  describe('Integration with specific strategies', () => {
    it('should integrate with TypewriterAnimationStrategy', () => {
      const typewriterStrategy = new TypewriterAnimationStrategy();
      strategyManager.registerStrategy('typewriter', typewriterStrategy);

      strategyManager.selectStrategy('animation', 'typewriter');
      const selectedStrategy = strategyManager.getCurrentStrategy('animation');

      expect(selectedStrategy).toBe(typewriterStrategy);
      expect(selectedStrategy.canAnimate()).toBe(true);
    });

    it('should integrate with FadeInAnimationStrategy', () => {
      const fadeInStrategy = new FadeInAnimationStrategy();
      strategyManager.registerStrategy('fade-in', fadeInStrategy);

      strategyManager.selectStrategy('animation', 'fade-in');
      const selectedStrategy = strategyManager.getCurrentStrategy('animation');

      expect(selectedStrategy).toBe(fadeInStrategy);
      expect(selectedStrategy.canAnimate()).toBe(true);
    });

    it('should integrate with RealTimeStreamingStrategy', () => {
      const realTimeStrategy = new RealTimeStreamingStrategy();
      strategyManager.registerStrategy('real-time', realTimeStrategy);

      strategyManager.selectStrategy('streaming', 'real-time');
      const selectedStrategy = strategyManager.getCurrentStrategy('streaming');

      expect(selectedStrategy).toBe(realTimeStrategy);
      expect(selectedStrategy.canStream()).toBe(true);
    });

    it('should integrate with BufferedStreamingStrategy', () => {
      const bufferedStrategy = new BufferedStreamingStrategy();
      strategyManager.registerStrategy('buffered', bufferedStrategy);

      strategyManager.selectStrategy('streaming', 'buffered');
      const selectedStrategy = strategyManager.getCurrentStrategy('streaming');

      expect(selectedStrategy).toBe(bufferedStrategy);
      expect(selectedStrategy.canStream()).toBe(true);
    });
  });
}); 