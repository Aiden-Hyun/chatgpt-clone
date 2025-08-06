import { useEffect, useRef } from 'react';

interface RenderCounterOptions {
  componentName?: string;
  enabled?: boolean;
  logThreshold?: number;
}

/**
 * Hook to count component re-renders for performance monitoring
 * Usage: const renderCount = useRenderCounter({ componentName: 'ChatInput' });
 */
export const useRenderCounter = (options: RenderCounterOptions = {}) => {
  const { componentName = 'Component', enabled = true, logThreshold = 5 } = options;
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Log if render count exceeds threshold
    if (renderCount.current >= logThreshold) {
      console.log(`[RENDER-COUNT] ${componentName}: ${renderCount.current} renders (${timeSinceLastRender}ms since last)`);
    }

    // Log every 10th render
    if (renderCount.current % 10 === 0) {
      console.log(`[RENDER-COUNT] ${componentName}: ${renderCount.current} total renders`);
    }
  });

  return {
    renderCount: renderCount.current,
    resetCount: () => {
      renderCount.current = 0;
      lastRenderTime.current = Date.now();
    },
    getStats: () => ({
      totalRenders: renderCount.current,
      timeSinceLastRender: Date.now() - lastRenderTime.current,
    }),
  };
};

/**
 * HOC to wrap components with render counting
 * Usage: const MonitoredComponent = withRenderCounter(MyComponent, 'MyComponent');
 */
export const withRenderCounter = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    const { renderCount } = useRenderCounter({ componentName });
    
    return <Component {...props} renderCount={renderCount} />;
  };

  WrappedComponent.displayName = `withRenderCounter(${componentName})`;
  return WrappedComponent;
};

/**
 * Utility to track render performance across multiple components
 */
export class RenderPerformanceTracker {
  private static instance: RenderPerformanceTracker;
  private renderCounts: Map<string, number> = new Map();
  private renderTimes: Map<string, number[]> = new Map();

  static getInstance(): RenderPerformanceTracker {
    if (!RenderPerformanceTracker.instance) {
      RenderPerformanceTracker.instance = new RenderPerformanceTracker();
    }
    return RenderPerformanceTracker.instance;
  }

  trackRender(componentName: string, renderTime: number = Date.now()) {
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);

    const times = this.renderTimes.get(componentName) || [];
    times.push(renderTime);
    this.renderTimes.set(componentName, times);
  }

  getStats(componentName?: string) {
    if (componentName) {
      return {
        componentName,
        renderCount: this.renderCounts.get(componentName) || 0,
        renderTimes: this.renderTimes.get(componentName) || [],
      };
    }

    return Array.from(this.renderCounts.entries()).map(([name, count]) => ({
      componentName: name,
      renderCount: count,
      renderTimes: this.renderTimes.get(name) || [],
    }));
  }

  reset() {
    this.renderCounts.clear();
    this.renderTimes.clear();
  }

  logSummary() {
    const stats = this.getStats();
    console.log('[RENDER-PERFORMANCE] Summary:');
    stats.forEach(({ componentName, renderCount }) => {
      console.log(`  ${componentName}: ${renderCount} renders`);
    });
  }
} 