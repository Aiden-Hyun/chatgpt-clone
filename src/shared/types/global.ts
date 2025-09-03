// src/shared/types/global.ts

// Global debug variables interface
export interface DebugGlobals {
  navRenderCount?: number;
  prevWrapperDeps?: unknown;
  chatInterfaceRenderCount?: number;
  prevChatInterfaceProps?: unknown;
  useChatRenderCount?: number;
  useChatStartTime?: number;
  pureRenderCount?: number;
}

// Extend the global interface
declare global {
  var navRenderCount: number | undefined;
  var prevWrapperDeps: unknown | undefined;
  var chatInterfaceRenderCount: number | undefined;
  var prevChatInterfaceProps: unknown | undefined;
  var useChatRenderCount: number | undefined;
  var useChatStartTime: number | undefined;
  var pureRenderCount: number | undefined;
}
