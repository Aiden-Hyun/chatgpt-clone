import { Logger } from "./Logger";

/**
 * Console interceptor that overrides console methods to use centralized logging
 * This provides a bridge during migration from direct console usage
 */
export class ConsoleInterceptor {
  private static isIntercepted = false;
  public static originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  } | null = null;

  /**
   * Intercept console methods and route them through the centralized logger
   */
  static intercept(): void {
    if (this.isIntercepted) {
      return;
    }

    // Store original console methods
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const logger = Logger.getInstance("ConsoleInterceptor");

    // Override console methods
    console.log = (...args: any[]) => {
      const message = args.join(" ");
      logger.debug(message);
    };

    console.info = (...args: any[]) => {
      const message = args.join(" ");
      logger.info(message);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(" ");
      logger.warn(message);
    };

    console.error = (...args: any[]) => {
      const message = args.join(" ");
      logger.error(message);
    };

    this.isIntercepted = true;
  }

  /**
   * Restore original console methods
   */
  static restore(): void {
    if (!this.isIntercepted || !this.originalConsole) {
      return;
    }

    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;

    this.isIntercepted = false;
    this.originalConsole = null;
  }

  /**
   * Check if console is currently intercepted
   */
  static isActive(): boolean {
    return this.isIntercepted;
  }
}
