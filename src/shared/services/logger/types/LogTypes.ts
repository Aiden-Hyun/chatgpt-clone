import { LogLevelString } from "../LogLevel";

export interface ILogFormatter {
  formatMessage(
    level: LogLevelString,
    message: string,
    filePath?: string,
    lineNumber?: number,
    context?: string
  ): string;
}

export interface ILogWriter {
  write(formattedMessage: string, data?: any): void;
}
