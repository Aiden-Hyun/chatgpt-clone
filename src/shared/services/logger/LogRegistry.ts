import { Logger } from "./Logger";

const instances: Map<string, Logger> = new Map();

export const getInstance = (context?: string): Logger => {
  const contextKey = context || "default";

  if (!instances.has(contextKey)) {
    instances.set(contextKey, new Logger(context));
  }

  return instances.get(contextKey)!;
};

export const getLogger = (context?: string): Logger => getInstance(context);
