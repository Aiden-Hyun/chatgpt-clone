interface LogContext {
  messageId?: string;
  roomId?: number;
  operation?: string;
  timestamp?: number;
  duration?: number;
  error?: Error;
  // Additional properties for concurrent message processing
  processingCount?: number;
  isProcessing?: boolean;
  contentLength?: number;
  queueSize?: number;
  status?: string;
  [key: string]: any;
}

class ConcurrentMessageLogger {
  private static instance: ConcurrentMessageLogger;
  private static isDev = typeof __DEV__ !== 'undefined' && __DEV__;
  
  static getInstance(): ConcurrentMessageLogger {
    if (!ConcurrentMessageLogger.instance) {
      ConcurrentMessageLogger.instance = new ConcurrentMessageLogger();
    }
    return ConcurrentMessageLogger.instance;
  }

  private sanitizeValue(value: any): any {
    if (!value || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      return value.map(v => this.sanitizeValue(v));
    }

    const clone: Record<string, any> = { ...value };
    for (const key of Object.keys(clone)) {
      const lower = key.toLowerCase();

      if (lower.includes('token') || lower.includes('secret') || lower.includes('apikey') || lower.includes('api_key') || lower === 'authorization' || lower.includes('password')) {
        clone[key] = '***';
        continue;
      }

      if (lower === 'session') {
        const s = clone[key] || {};
        clone[key] = {
          user: { id: s?.user?.id },
          expires_at: s?.expires_at,
        };
        continue;
      }

      clone[key] = this.sanitizeValue(clone[key]);
    }
    return clone;
  }

  private log(level: 'info' | 'debug' | 'warn' | 'error', message: string, context: LogContext = {}) {
    const payload = this.sanitizeValue({
      ...context,
      timestamp: Date.now(),
      level: level.toUpperCase()
    });

    if (level === 'warn') {
      console.warn(`2️⃣ [CONCURRENT-MSG] ${message}`, payload);
      return;
    }
    if (level === 'error') {
      console.error(`2️⃣ [CONCURRENT-MSG] ${message}`, { ...payload, stack: context.error?.stack });
      return;
    }
    if (ConcurrentMessageLogger.isDev) {
      if (level === 'debug') {
        console.debug(`2️⃣ [CONCURRENT-MSG] ${message}`, payload);
      } else {
        console.log(`2️⃣ [CONCURRENT-MSG] ${message}`, payload);
      }
    }
  }

  info(message: string, context: LogContext = {}) { this.log('info', message, context); }
  debug(message: string, context: LogContext = {}) { this.log('debug', message, context); }
  warn(message: string, context: LogContext = {}) { this.log('warn', message, context); }
  error(message: string, context: LogContext = {}) { this.log('error', message, context); }

  performance(operation: string, duration: number, context: LogContext = {}) {
    if (!ConcurrentMessageLogger.isDev) return;
    const payload = this.sanitizeValue({
      ...context,
      timestamp: Date.now(),
      duration,
      level: 'PERFORMANCE'
    });
    console.log(`2️⃣ [CONCURRENT-MSG-PERF] ${operation} took ${duration}ms`, payload);
  }
}

export const logger = ConcurrentMessageLogger.getInstance(); 