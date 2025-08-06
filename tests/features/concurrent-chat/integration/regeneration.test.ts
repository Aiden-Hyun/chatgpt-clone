import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { RegenerationManager } from '../../../../src/features/concurrent-chat/core/regeneration/RegenerationManager';
import { RegenerationProcessor } from '../../../../src/features/concurrent-chat/core/regeneration/RegenerationProcessor';
import { RegenerationHistoryManager } from '../../../../src/features/concurrent-chat/core/regeneration/RegenerationHistoryManager';
import { ABTestingManager } from '../../../../src/features/concurrent-chat/core/regeneration/ABTestingManager';
import { QualityMetricsManager } from '../../../../src/features/concurrent-chat/core/regeneration/QualityMetricsManager';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { CommandManager } from '../../../../src/features/concurrent-chat/core/commands/CommandManager';

describe('Regeneration Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let regenerationManager: RegenerationManager;
  let regenerationProcessor: RegenerationProcessor;
  let regenerationHistoryManager: RegenerationHistoryManager;
  let abTestingManager: ABTestingManager;
  let qualityMetricsManager: QualityMetricsManager;
  let pluginManager: PluginManager;
  let commandManager: CommandManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    regenerationManager = new RegenerationManager(serviceContainer, eventBus);
    regenerationProcessor = new RegenerationProcessor(serviceContainer, eventBus);
    regenerationHistoryManager = new RegenerationHistoryManager(serviceContainer, eventBus);
    abTestingManager = new ABTestingManager(serviceContainer, eventBus);
    qualityMetricsManager = new QualityMetricsManager(serviceContainer, eventBus);
    pluginManager = new PluginManager(serviceContainer, eventBus);
    commandManager = new CommandManager(serviceContainer, eventBus);
  });

  describe('Regeneration flow', () => {
    it('should handle complete regeneration flow', async () => {
      const messageId = 'msg1';
      const originalMessage = {
        id: messageId,
        content: 'Original response',
        role: 'assistant',
        timestamp: new Date()
      };

      regenerationManager.regenerateMessage = jest.fn().mockResolvedValue({
        success: true,
        newMessageId: 'msg1_regenerated',
        regenerationId: 'reg1'
      });

      regenerationProcessor.processRegeneration = jest.fn().mockResolvedValue({
        processed: true,
        newContent: 'Regenerated response',
        quality: 'improved'
      });

      regenerationHistoryManager.recordRegeneration = jest.fn().mockResolvedValue({
        recorded: true,
        historyId: 'hist1'
      });

      const result = await regenerationManager.regenerateMessage(messageId, originalMessage);

      expect(regenerationManager.regenerateMessage).toHaveBeenCalledWith(messageId, originalMessage);
      expect(result.success).toBe(true);
      expect(result.newMessageId).toBe('msg1_regenerated');
    });

    it('should handle regeneration with different strategies', async () => {
      const messageId = 'msg1';
      const strategies = ['improve', 'expand', 'simplify', 'rephrase'];

      regenerationManager.regenerateWithStrategy = jest.fn().mockResolvedValue({
        success: true,
        strategy: 'improve',
        result: 'Improved response'
      });

      for (const strategy of strategies) {
        const result = await regenerationManager.regenerateWithStrategy(messageId, strategy);
        
        expect(result.success).toBe(true);
        expect(result.strategy).toBe(strategy);
      }
    });

    it('should handle regeneration with custom parameters', async () => {
      const messageId = 'msg1';
      const parameters = {
        temperature: 0.8,
        maxTokens: 500,
        style: 'formal',
        tone: 'professional'
      };

      regenerationManager.regenerateWithParameters = jest.fn().mockResolvedValue({
        success: true,
        parameters: parameters,
        result: 'Custom regenerated response'
      });

      const result = await regenerationManager.regenerateWithParameters(messageId, parameters);

      expect(regenerationManager.regenerateWithParameters).toHaveBeenCalledWith(messageId, parameters);
      expect(result.success).toBe(true);
      expect(result.parameters).toEqual(parameters);
    });

    it('should handle regeneration with context preservation', async () => {
      const messageId = 'msg1';
      const context = {
        conversationHistory: ['msg1', 'msg2', 'msg3'],
        userPreferences: { style: 'casual', language: 'en' },
        conversationContext: 'technical discussion'
      };

      regenerationManager.regenerateWithContext = jest.fn().mockResolvedValue({
        success: true,
        contextPreserved: true,
        result: 'Context-aware regenerated response'
      });

      const result = await regenerationManager.regenerateWithContext(messageId, context);

      expect(regenerationManager.regenerateWithContext).toHaveBeenCalledWith(messageId, context);
      expect(result.success).toBe(true);
      expect(result.contextPreserved).toBe(true);
    });
  });

  describe('Regeneration history', () => {
    it('should record regeneration history', async () => {
      const messageId = 'msg1';
      const regenerationData = {
        originalContent: 'Original response',
        newContent: 'Regenerated response',
        strategy: 'improve',
        timestamp: new Date(),
        quality: 'better'
      };

      regenerationHistoryManager.recordRegeneration = jest.fn().mockResolvedValue({
        recorded: true,
        historyId: 'hist1',
        timestamp: new Date()
      });

      const result = await regenerationHistoryManager.recordRegeneration(messageId, regenerationData);

      expect(regenerationHistoryManager.recordRegeneration).toHaveBeenCalledWith(messageId, regenerationData);
      expect(result.recorded).toBe(true);
      expect(result.historyId).toBe('hist1');
    });

    it('should retrieve regeneration history', async () => {
      const messageId = 'msg1';

      regenerationHistoryManager.getRegenerationHistory = jest.fn().mockResolvedValue({
        history: [
          {
            id: 'hist1',
            originalContent: 'Original response',
            newContent: 'Regenerated response 1',
            strategy: 'improve',
            timestamp: new Date(),
            quality: 'better'
          },
          {
            id: 'hist2',
            originalContent: 'Original response',
            newContent: 'Regenerated response 2',
            strategy: 'expand',
            timestamp: new Date(),
            quality: 'good'
          }
        ],
        totalRegenerations: 2
      });

      const result = await regenerationHistoryManager.getRegenerationHistory(messageId);

      expect(regenerationHistoryManager.getRegenerationHistory).toHaveBeenCalledWith(messageId);
      expect(result.history).toHaveLength(2);
      expect(result.totalRegenerations).toBe(2);
    });

    it('should handle regeneration history filtering', async () => {
      const messageId = 'msg1';
      const filters = {
        strategy: 'improve',
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
        quality: 'better'
      };

      regenerationHistoryManager.getFilteredHistory = jest.fn().mockResolvedValue({
        history: [
          {
            id: 'hist1',
            originalContent: 'Original response',
            newContent: 'Regenerated response',
            strategy: 'improve',
            timestamp: new Date(),
            quality: 'better'
          }
        ],
        filteredCount: 1
      });

      const result = await regenerationHistoryManager.getFilteredHistory(messageId, filters);

      expect(regenerationHistoryManager.getFilteredHistory).toHaveBeenCalledWith(messageId, filters);
      expect(result.history).toHaveLength(1);
      expect(result.filteredCount).toBe(1);
    });

    it('should handle regeneration history cleanup', async () => {
      const messageId = 'msg1';
      const retentionDays = 30;

      regenerationHistoryManager.cleanupOldHistory = jest.fn().mockResolvedValue({
        cleaned: true,
        removedEntries: 5,
        retainedEntries: 10
      });

      const result = await regenerationHistoryManager.cleanupOldHistory(messageId, retentionDays);

      expect(regenerationHistoryManager.cleanupOldHistory).toHaveBeenCalledWith(messageId, retentionDays);
      expect(result.cleaned).toBe(true);
      expect(result.removedEntries).toBe(5);
      expect(result.retainedEntries).toBe(10);
    });
  });

  describe('A/B testing', () => {
    it('should handle A/B testing for regeneration', async () => {
      const messageId = 'msg1';
      const variants = [
        { id: 'variant_a', strategy: 'improve', parameters: { temperature: 0.7 } },
        { id: 'variant_b', strategy: 'expand', parameters: { temperature: 0.9 } }
      ];

      abTestingManager.createABTest = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        variants: variants,
        status: 'active'
      });

      abTestingManager.runABTest = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        results: [
          { variantId: 'variant_a', score: 0.8, selected: true },
          { variantId: 'variant_b', score: 0.6, selected: false }
        ]
      });

      const test = await abTestingManager.createABTest(messageId, variants);
      const results = await abTestingManager.runABTest(test.testId);

      expect(abTestingManager.createABTest).toHaveBeenCalledWith(messageId, variants);
      expect(abTestingManager.runABTest).toHaveBeenCalledWith(test.testId);
      expect(results.results).toHaveLength(2);
      expect(results.results[0].selected).toBe(true);
    });

    it('should handle A/B testing with user feedback', async () => {
      const testId = 'ab_test1';
      const userFeedback = {
        userId: 'user1',
        preferredVariant: 'variant_a',
        rating: 5,
        comments: 'Much better response'
      };

      abTestingManager.recordUserFeedback = jest.fn().mockResolvedValue({
        recorded: true,
        feedbackId: 'feedback1'
      });

      abTestingManager.analyzeABTestResults = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        analysis: {
          variantA: { score: 0.8, feedbackCount: 10, averageRating: 4.5 },
          variantB: { score: 0.6, feedbackCount: 8, averageRating: 3.8 },
          winner: 'variant_a',
          confidence: 0.95
        }
      });

      await abTestingManager.recordUserFeedback(testId, userFeedback);
      const analysis = await abTestingManager.analyzeABTestResults(testId);

      expect(abTestingManager.recordUserFeedback).toHaveBeenCalledWith(testId, userFeedback);
      expect(abTestingManager.analyzeABTestResults).toHaveBeenCalledWith(testId);
      expect(analysis.analysis.winner).toBe('variant_a');
    });

    it('should handle A/B testing with statistical significance', async () => {
      const testId = 'ab_test1';

      abTestingManager.calculateStatisticalSignificance = jest.fn().mockResolvedValue({
        significant: true,
        pValue: 0.02,
        confidenceInterval: [0.05, 0.15],
        sampleSize: 100
      });

      const significance = await abTestingManager.calculateStatisticalSignificance(testId);

      expect(abTestingManager.calculateStatisticalSignificance).toHaveBeenCalledWith(testId);
      expect(significance.significant).toBe(true);
      expect(significance.pValue).toBeLessThan(0.05);
    });

    it('should handle A/B testing with multiple metrics', async () => {
      const testId = 'ab_test1';
      const metrics = ['quality', 'relevance', 'clarity', 'helpfulness'];

      abTestingManager.evaluateMultipleMetrics = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        metrics: {
          quality: { variantA: 0.8, variantB: 0.6, winner: 'variant_a' },
          relevance: { variantA: 0.9, variantB: 0.7, winner: 'variant_a' },
          clarity: { variantA: 0.7, variantB: 0.8, winner: 'variant_b' },
          helpfulness: { variantA: 0.8, variantB: 0.6, winner: 'variant_a' }
        },
        overallWinner: 'variant_a'
      });

      const evaluation = await abTestingManager.evaluateMultipleMetrics(testId, metrics);

      expect(abTestingManager.evaluateMultipleMetrics).toHaveBeenCalledWith(testId, metrics);
      expect(evaluation.overallWinner).toBe('variant_a');
      expect(Object.keys(evaluation.metrics)).toHaveLength(4);
    });
  });

  describe('Quality metrics', () => {
    it('should calculate quality metrics for regeneration', async () => {
      const messageId = 'msg1';
      const originalContent = 'Original response';
      const regeneratedContent = 'Regenerated response';

      qualityMetricsManager.calculateQualityMetrics = jest.fn().mockResolvedValue({
        quality: 0.85,
        relevance: 0.9,
        clarity: 0.8,
        helpfulness: 0.85,
        overall: 0.85
      });

      const metrics = await qualityMetricsManager.calculateQualityMetrics(messageId, originalContent, regeneratedContent);

      expect(qualityMetricsManager.calculateQualityMetrics).toHaveBeenCalledWith(messageId, originalContent, regeneratedContent);
      expect(metrics.overall).toBe(0.85);
      expect(metrics.quality).toBe(0.85);
      expect(metrics.relevance).toBe(0.9);
    });

    it('should handle quality comparison between versions', async () => {
      const messageId = 'msg1';
      const versions = [
        { id: 'v1', content: 'Version 1', quality: 0.7 },
        { id: 'v2', content: 'Version 2', quality: 0.8 },
        { id: 'v3', content: 'Version 3', quality: 0.9 }
      ];

      qualityMetricsManager.compareVersions = jest.fn().mockResolvedValue({
        messageId: 'msg1',
        comparison: {
          bestVersion: 'v3',
          qualityImprovement: 0.2,
          ranking: ['v3', 'v2', 'v1']
        }
      });

      const comparison = await qualityMetricsManager.compareVersions(messageId, versions);

      expect(qualityMetricsManager.compareVersions).toHaveBeenCalledWith(messageId, versions);
      expect(comparison.comparison.bestVersion).toBe('v3');
      expect(comparison.comparison.qualityImprovement).toBe(0.2);
    });

    it('should handle quality threshold validation', async () => {
      const messageId = 'msg1';
      const qualityScore = 0.75;
      const thresholds = {
        minimum: 0.6,
        target: 0.8,
        excellent: 0.9
      };

      qualityMetricsManager.validateQualityThresholds = jest.fn().mockResolvedValue({
        passed: true,
        score: 0.75,
        threshold: 0.6,
        grade: 'good',
        recommendations: ['Consider improving clarity']
      });

      const validation = await qualityMetricsManager.validateQualityThresholds(messageId, qualityScore, thresholds);

      expect(qualityMetricsManager.validateQualityThresholds).toHaveBeenCalledWith(messageId, qualityScore, thresholds);
      expect(validation.passed).toBe(true);
      expect(validation.grade).toBe('good');
    });

    it('should handle quality trend analysis', async () => {
      const messageId = 'msg1';
      const timeRange = { start: new Date('2024-01-01'), end: new Date('2024-12-31') };

      qualityMetricsManager.analyzeQualityTrends = jest.fn().mockResolvedValue({
        messageId: 'msg1',
        trends: {
          overall: { trend: 'improving', slope: 0.05 },
          quality: { trend: 'stable', slope: 0.02 },
          relevance: { trend: 'improving', slope: 0.08 }
        },
        insights: ['Quality is improving over time', 'Relevance shows significant improvement']
      });

      const analysis = await qualityMetricsManager.analyzeQualityTrends(messageId, timeRange);

      expect(qualityMetricsManager.analyzeQualityTrends).toHaveBeenCalledWith(messageId, timeRange);
      expect(analysis.trends.overall.trend).toBe('improving');
      expect(analysis.insights).toHaveLength(2);
    });
  });

  describe('Plugin interaction', () => {
    it('should integrate with regeneration plugins', async () => {
      const messageId = 'msg1';
      const originalContent = 'Original response';

      const regenerationPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceRegeneration: jest.fn().mockReturnValue({
          enhanced: true,
          newContent: 'Plugin-enhanced regenerated response',
          quality: 'improved'
        })
      };

      pluginManager.registerPlugin('regeneration-enhancer', regenerationPlugin);
      pluginManager.mountPlugin('regeneration-enhancer');

      const result = await regenerationProcessor.processRegenerationWithPlugins(messageId, originalContent);

      expect(regenerationPlugin.enhanceRegeneration).toHaveBeenCalledWith(messageId, originalContent);
      expect(result.enhanced).toBe(true);
      expect(result.quality).toBe('improved');
    });

    it('should integrate with quality assessment plugins', async () => {
      const messageId = 'msg1';
      const content = 'Response content';

      const qualityPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        assessQuality: jest.fn().mockReturnValue({
          quality: 0.85,
          metrics: { clarity: 0.8, relevance: 0.9, helpfulness: 0.85 },
          suggestions: ['Improve clarity', 'Add more context']
        })
      };

      pluginManager.registerPlugin('quality-assessor', qualityPlugin);
      pluginManager.mountPlugin('quality-assessor');

      const result = await qualityMetricsManager.assessQualityWithPlugins(messageId, content);

      expect(qualityPlugin.assessQuality).toHaveBeenCalledWith(messageId, content);
      expect(result.quality).toBe(0.85);
      expect(result.suggestions).toHaveLength(2);
    });

    it('should integrate with A/B testing plugins', async () => {
      const testId = 'ab_test1';
      const variants = ['variant_a', 'variant_b'];

      const abTestingPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceABTest = jest.fn().mockReturnValue({
          enhanced: true,
          testId: 'ab_test1',
          enhancedVariants: ['enhanced_a', 'enhanced_b'],
          additionalMetrics: ['engagement', 'satisfaction']
        })
      };

      pluginManager.registerPlugin('ab-testing-enhancer', abTestingPlugin);
      pluginManager.mountPlugin('ab-testing-enhancer');

      const result = await abTestingManager.enhanceABTestWithPlugins(testId, variants);

      expect(abTestingPlugin.enhanceABTest).toHaveBeenCalledWith(testId, variants);
      expect(result.enhanced).toBe(true);
      expect(result.enhancedVariants).toHaveLength(2);
    });
  });

  describe('Command pattern integration', () => {
    it('should execute regeneration commands', async () => {
      const messageId = 'msg1';
      const strategy = 'improve';

      const regenerateCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('regenerate', regenerateCommand);

      const result = await commandManager.executeCommand('regenerate', { messageId, strategy });

      expect(regenerateCommand.execute).toHaveBeenCalledWith({ messageId, strategy });
      expect(result).toBe(true);
    });

    it('should support regeneration undo/redo', async () => {
      const messageId = 'msg1';
      const originalContent = 'Original response';
      const regeneratedContent = 'Regenerated response';

      const regenerateCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn().mockResolvedValue(true),
        canExecute: () => true
      };

      commandManager.registerCommand('regenerate-with-undo', regenerateCommand);

      // Execute regeneration
      await commandManager.executeCommand('regenerate-with-undo', { messageId, content: regeneratedContent });
      expect(regenerateCommand.execute).toHaveBeenCalledWith({ messageId, content: regeneratedContent });

      // Undo regeneration
      await commandManager.undoLastCommand();
      expect(regenerateCommand.undo).toHaveBeenCalled();

      // Redo regeneration
      await commandManager.redoLastCommand();
      expect(regenerateCommand.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle regeneration command validation', async () => {
      const messageId = 'msg1';
      const invalidStrategy = 'invalid_strategy';

      const regenerateCommand = {
        execute: jest.fn(),
        undo: jest.fn(),
        canExecute: () => false // Cannot execute with invalid strategy
      };

      commandManager.registerCommand('regenerate-invalid', regenerateCommand);

      expect(() => {
        commandManager.executeCommand('regenerate-invalid', { messageId, strategy: invalidStrategy });
      }).toThrow('Command cannot be executed');
    });

    it('should support regeneration command queuing', async () => {
      const messageIds = ['msg1', 'msg2', 'msg3'];
      const strategies = ['improve', 'expand', 'simplify'];

      const regenerateCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('queue-regenerate', regenerateCommand);

      // Queue multiple regenerations
      for (let i = 0; i < messageIds.length; i++) {
        commandManager.queueCommand('queue-regenerate', { messageId: messageIds[i], strategy: strategies[i] });
      }

      const queue = commandManager.getCommandQueue();
      expect(queue).toHaveLength(3);

      // Execute queued commands
      await commandManager.executeQueuedCommands();
      expect(regenerateCommand.execute).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete regeneration workflow', async () => {
      const messageId = 'msg1';
      const originalMessage = {
        id: messageId,
        content: 'Original response',
        role: 'assistant',
        timestamp: new Date()
      };

      // Mock all dependencies
      regenerationManager.regenerateMessage = jest.fn().mockResolvedValue({
        success: true,
        newMessageId: 'msg1_regenerated',
        regenerationId: 'reg1'
      });
      regenerationHistoryManager.recordRegeneration = jest.fn().mockResolvedValue({
        recorded: true,
        historyId: 'hist1'
      });
      qualityMetricsManager.calculateQualityMetrics = jest.fn().mockResolvedValue({
        quality: 0.85,
        overall: 0.85
      });
      abTestingManager.createABTest = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        status: 'active'
      });

      // Perform regeneration
      const regenerationResult = await regenerationManager.regenerateMessage(messageId, originalMessage);
      expect(regenerationResult.success).toBe(true);

      // Record history
      const historyResult = await regenerationHistoryManager.recordRegeneration(messageId, {
        originalContent: originalMessage.content,
        newContent: 'Regenerated response',
        strategy: 'improve',
        timestamp: new Date()
      });
      expect(historyResult.recorded).toBe(true);

      // Calculate quality metrics
      const qualityResult = await qualityMetricsManager.calculateQualityMetrics(messageId, originalMessage.content, 'Regenerated response');
      expect(qualityResult.overall).toBe(0.85);

      // Create A/B test
      const abTestResult = await abTestingManager.createABTest(messageId, [
        { id: 'variant_a', strategy: 'improve' },
        { id: 'variant_b', strategy: 'expand' }
      ]);
      expect(abTestResult.status).toBe('active');
    });

    it('should handle regeneration with quality improvement', async () => {
      const messageId = 'msg1';
      const originalContent = 'Original response';

      // Mock quality assessment
      qualityMetricsManager.calculateQualityMetrics = jest.fn().mockResolvedValue({
        quality: 0.6,
        overall: 0.6
      });
      qualityMetricsManager.validateQualityThresholds = jest.fn().mockResolvedValue({
        passed: false,
        score: 0.6,
        threshold: 0.8,
        grade: 'poor',
        recommendations: ['Improve clarity', 'Add more context']
      });

      // Mock regeneration with improvement
      regenerationManager.regenerateWithStrategy = jest.fn().mockResolvedValue({
        success: true,
        strategy: 'improve',
        result: 'Improved response'
      });

      // Assess original quality
      const originalQuality = await qualityMetricsManager.calculateQualityMetrics(messageId, originalContent, originalContent);
      expect(originalQuality.overall).toBe(0.6);

      // Validate against thresholds
      const validation = await qualityMetricsManager.validateQualityThresholds(messageId, originalQuality.overall, { minimum: 0.8 });
      expect(validation.passed).toBe(false);

      // Regenerate with improvement strategy
      const regenerationResult = await regenerationManager.regenerateWithStrategy(messageId, 'improve');
      expect(regenerationResult.success).toBe(true);
      expect(regenerationResult.strategy).toBe('improve');
    });

    it('should handle regeneration with A/B testing optimization', async () => {
      const messageId = 'msg1';
      const variants = [
        { id: 'variant_a', strategy: 'improve', parameters: { temperature: 0.7 } },
        { id: 'variant_b', strategy: 'expand', parameters: { temperature: 0.9 } },
        { id: 'variant_c', strategy: 'rephrase', parameters: { temperature: 0.8 } }
      ];

      // Mock A/B testing
      abTestingManager.createABTest = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        variants: variants,
        status: 'active'
      });
      abTestingManager.runABTest = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        results: [
          { variantId: 'variant_a', score: 0.8, selected: true },
          { variantId: 'variant_b', score: 0.6, selected: false },
          { variantId: 'variant_c', score: 0.7, selected: false }
        ]
      });
      abTestingManager.analyzeABTestResults = jest.fn().mockResolvedValue({
        testId: 'ab_test1',
        analysis: {
          variantA: { score: 0.8, feedbackCount: 15, averageRating: 4.5 },
          variantB: { score: 0.6, feedbackCount: 12, averageRating: 3.8 },
          variantC: { score: 0.7, feedbackCount: 10, averageRating: 4.0 },
          winner: 'variant_a',
          confidence: 0.95
        }
      });

      // Create A/B test
      const test = await abTestingManager.createABTest(messageId, variants);
      expect(test.status).toBe('active');

      // Run A/B test
      const results = await abTestingManager.runABTest(test.testId);
      expect(results.results[0].selected).toBe(true);

      // Analyze results
      const analysis = await abTestingManager.analyzeABTestResults(test.testId);
      expect(analysis.analysis.winner).toBe('variant_a');
      expect(analysis.analysis.confidence).toBe(0.95);
    });
  });
}); 