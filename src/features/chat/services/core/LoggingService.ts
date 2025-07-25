// src/features/chat/services/core/LoggingService.ts
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  data?: any;
}

export interface ILoggingService {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

export class LoggingService implements ILoggingService {
  constructor(private serviceName: string) {}

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      service: this.serviceName,
      ...data
    };

    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] DEBUG: ${message}`, data);
        break;
      case 'info':
        console.info(`[${timestamp}] INFO: ${message}`, data);
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN: ${message}`, data);
        break;
      case 'error':
        console.error(`[${timestamp}] ERROR: ${message}`, data);
        break;
    }

    // In production, you might want to send this to a logging service
    // this.loggingService.log(logEntry);
  }
} 