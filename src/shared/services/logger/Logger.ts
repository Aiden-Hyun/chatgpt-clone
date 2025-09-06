import * as LogConfig from "./LogConfig";
import * as LogFormatter from "./LogFormatter";
import { LogLevel } from "./LogLevel";
import * as LogWriter from "./LogWriter";

export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  debug(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (LogConfig.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = LogFormatter.formatMessage(
        "debug",
        message,
        lineNumber,
        LogWriter.getLineCounter() + 1,
        this.context,
        filePath
      );
      LogWriter.write(formattedMessage, data);
    }
  }

  info(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (LogConfig.shouldLog(LogLevel.INFO)) {
      const formattedMessage = LogFormatter.formatMessage(
        "info",
        message,
        lineNumber,
        LogWriter.getLineCounter() + 1,
        this.context,
        filePath
      );
      LogWriter.write(formattedMessage, data);
    }
  }

  warn(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (LogConfig.shouldLog(LogLevel.WARN)) {
      const formattedMessage = LogFormatter.formatMessage(
        "warn",
        message,
        lineNumber,
        LogWriter.getLineCounter() + 1,
        this.context,
        filePath
      );
      LogWriter.write(formattedMessage, data);
    }
  }

  error(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (LogConfig.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = LogFormatter.formatMessage(
        "error",
        message,
        lineNumber,
        LogWriter.getLineCounter() + 1,
        this.context,
        filePath
      );
      LogWriter.write(formattedMessage, data);
    }
  }
}
