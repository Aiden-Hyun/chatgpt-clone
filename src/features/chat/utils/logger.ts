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
}

class ConcurrentMessageLogger {
  private static instance: ConcurrentMessageLogger;
  
  static getInstance(): ConcurrentMessageLogger {
    if (!ConcurrentMessageLogger.instance) {
      ConcurrentMessageLogger.instance = new ConcurrentMessageLogger();
    }
    return ConcurrentMessageLogger.instance;
  }

  info(message: string, context: LogContext = {}) {
    console.log(`2️⃣ [CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'INFO'
    });
  }

  debug(message: string, context: LogContext = {}) {
    console.debug(`2️⃣ [CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'DEBUG'
    });
  }

  warn(message: string, context: LogContext = {}) {
    console.warn(`2️⃣ [CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'WARN'
    });
  }

  error(message: string, context: LogContext = {}) {
    console.error(`2️⃣ [CONCURRENT-MSG] ${message}`, {
      ...context,
      timestamp: Date.now(),
      level: 'ERROR',
      stack: context.error?.stack
    });
  }

  performance(operation: string, duration: number, context: LogContext = {}) {
    console.log(`2️⃣ [CONCURRENT-MSG-PERF] ${operation} took ${duration}ms`, {
      ...context,
      timestamp: Date.now(),
      duration,
      level: 'PERFORMANCE'
    });
  }
}

export const logger = ConcurrentMessageLogger.getInstance(); 