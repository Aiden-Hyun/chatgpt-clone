import { getLogger } from "../services/logger";
import type { DebugGlobals } from "../types/global";

/**
 * Utility to reset all debug global variables
 * Called when app backgrounds/foregrounds to prevent memory leaks
 */
export const resetDebugGlobals = () => {
  if (__DEV__) {
    const logger = getLogger("DebugGlobals");

    // Reset all known global debug variables
    const globalKeys = [
      "navRenderCount",
      "prevWrapperDeps",
      "chatInterfaceRenderCount",
      "prevChatInterfaceProps",
      "useChatRenderCount",
      "useChatStartTime",
      "pureRenderCount",
    ];

    globalKeys.forEach((key) => {
      if ((global as DebugGlobals)[key as keyof DebugGlobals] !== undefined) {
        delete (global as DebugGlobals)[key as keyof DebugGlobals];
      }
    });

    logger.debug("Reset global debug variables", { globalKeys });
  }
};
