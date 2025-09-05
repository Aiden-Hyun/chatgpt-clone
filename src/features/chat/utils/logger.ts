import { getLogger } from "@/shared/services/logger";

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
  [key: string]: unknown;
}

class ConcurrentMessageLogger {
  private static instance: ConcurrentMessageLogger;
  private static isDev = typeof __DEV__ !== "undefined" && __DEV__;
  private logger = getLogger("ConcurrentMessageLogger");

  static getInstance(): ConcurrentMessageLogger {
    if (!ConcurrentMessageLogger.instance) {
      ConcurrentMessageLogger.instance = new ConcurrentMessageLogger();
    }
    return ConcurrentMessageLogger.instance;
  }

  private sanitizeValue(value: unknown): unknown {
    if (!value || typeof value !== "object") return value;

    if (Array.isArray(value)) {
      return value.map((v) => this.sanitizeValue(v));
    }

    const clone: Record<string, unknown> = { ...value };
    for (const key of Object.keys(clone)) {
      const lower = key.toLowerCase();

      if (
        lower.includes("token") ||
        lower.includes("secret") ||
        lower.includes("apikey") ||
        lower.includes("api_key") ||
        lower === "authorization" ||
        lower.includes("password")
      ) {
        clone[key] = "***";
        continue;
      }

      if (lower === "session") {
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

  private log(
    level: "info" | "debug" | "warn" | "error",
    message: string,
    context: LogContext = {}
  ) {
    const payload = this.sanitizeValue({
      ...context,
      timestamp: Date.now(),
      level: level.toUpperCase(),
    });

    if (level === "warn") {
      this.logger.warn(message, payload);
      return;
    }
    if (level === "error") {
      this.logger.error(message, {
        ...payload,
        stack: context.error?.stack,
      });
      return;
    }
    if (ConcurrentMessageLogger.isDev) {
      if (level === "debug") {
        this.logger.debug(message, payload);
      } else {
        this.logger.info(message, payload);
      }
    }
  }

  info(message: string, context: LogContext = {}) {
    this.log("info", message, context);
  }
  debug(message: string, context: LogContext = {}) {
    this.log("debug", message, context);
  }
  warn(message: string, context: LogContext = {}) {
    this.log("warn", message, context);
  }
  error(message: string, context: LogContext = {}) {
    this.log("error", message, context);
  }

  performance(operation: string, duration: number, context: LogContext = {}) {
    if (!ConcurrentMessageLogger.isDev) return;
    const payload = this.sanitizeValue({
      ...context,
      timestamp: Date.now(),
      duration,
      level: "PERFORMANCE",
    });
    this.logger.info(
      `2️⃣ [CONCURRENT-MSG-PERF] ${operation} took ${duration}ms`,
      payload
    );
  }
}

export const logger = ConcurrentMessageLogger.getInstance();
