/**
 * Utility to reset all debug global variables
 * Called when app backgrounds/foregrounds to prevent memory leaks
 */
export const resetDebugGlobals = () => {
  if (__DEV__) {
    // Reset all known global debug variables
    const globalKeys = [
      'navRenderCount',
      'prevWrapperDeps', 
        'chatInterfaceRenderCount',
  'prevChatInterfaceProps',
      'useChatRenderCount',
      'useChatStartTime',
      'pureRenderCount'
    ];

    globalKeys.forEach(key => {
      if ((global as Record<string, unknown>)[key] !== undefined) {
        delete (global as Record<string, unknown>)[key];
      }
    });

    console.log('🧹 [DEBUG] Reset global debug variables');
  }
};

