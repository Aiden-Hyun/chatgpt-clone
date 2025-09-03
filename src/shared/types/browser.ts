// src/shared/types/browser.ts

// Browser Navigator types
export interface NavigatorWithClipboard extends Navigator {
  clipboard?: Clipboard;
}

export interface Clipboard {
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
}

// Browser Window types
export interface WindowWithSecureContext extends Window {
  isSecureContext?: boolean;
}

// Expo Clipboard types
export interface ExpoClipboard {
  setStringAsync(text: string): Promise<void>;
  setString(text: string): void;
  getStringAsync(): Promise<string>;
}
