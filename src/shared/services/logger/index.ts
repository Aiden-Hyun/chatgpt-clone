// Barrel file for logger module
export { ConsoleInterceptor } from "./ConsoleInterceptor";
export { Logger } from "./Logger";
export { LogLevel, LogLevelString } from "./LogLevel";

// Re-export the main logger instance and configuration functions
export {
  getLogger,
  getLoggerWithFile,
  setLogLevel,
  setShowFileInfo,
  setShowFullPath,
} from "./Logger";
