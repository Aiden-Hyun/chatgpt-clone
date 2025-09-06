import { LogLevel } from "./LogLevel";

const isDevelopment = __DEV__;
let logLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;

export const setLogLevel = (level: LogLevel): void => {
  logLevel = level;
};

export const shouldLog = (level: LogLevel): boolean => {
  return level >= logLevel;
};
