// src/features/chat/services/core/LoggingService.ts
import { getLogger } from "@/shared/services/logger";

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  service: string;
  data?: unknown;
}

export interface ILoggingService {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export class LoggingService implements ILoggingService {
  private logger = getLogger("LoggingService");

  constructor(private serviceName: string) {}

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  private log(
    level: "debug" | "info" | "warn" | "error",
    message: string,
    data?: unknown
  ): void {
    const timestamp = new Date().toISOString();
    const _logEntry: LogEntry = {
      timestamp,
      level,
      message,
      service: this.serviceName,
      ...data,
    };

    switch (level) {
      case "debug":
        this.logger.debug(message, data);
        break;
      case "info":
        this.logger.info(message, data);
        break;
      case "warn":
        this.logger.warn(message, data);
        break;
      case "error":
        this.logger.error(message, data);
        break;
    }

    // In production, you might want to send this to a logging service
    // this.loggingService.log(logEntry);
  }
}
