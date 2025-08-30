import { Platform } from 'react-native';

import { IClipboardService } from '../interfaces';

/**
 * Cross-platform clipboard service implementation.
 * - Web: prefers Navigator Clipboard API, falls back to hidden textarea.
 * - Native: uses expo-clipboard.
 */
export class ClipboardService implements IClipboardService {
  copyToClipboard(_unusedText: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getFromClipboard(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  hasString(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async copy(text: string): Promise<void> {
    if (!text || text.length === 0) {
      return;
    }

    if (Platform.OS === 'web') {
      try {
        const hasNavigator = typeof navigator !== 'undefined' && !!navigator;
        const isSecure = typeof window !== 'undefined' && window.isSecureContext !== false;
        if (hasNavigator && navigator.clipboard && isSecure) {
          await navigator.clipboard.writeText(text);
          return;
        }
      } catch {}

      try {
        // Fallback: hidden textarea + execCommand('copy')
        if (typeof document !== 'undefined') {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.top = '-9999px';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return;
          } catch (_unusedErr) {
            document.body.removeChild(textarea);
            throw _unusedErr;
          }
        }
      } catch (_unusedErr) {
        throw new Error('Failed to copy to clipboard');
      }
      throw new Error('Clipboard API is not available');
    }

    // Native (iOS/Android)
    try {
      const Clipboard = await import('expo-clipboard');
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(text);
      } else if (Clipboard.setString) {
        Clipboard.setString(text);
      } else {
        throw new Error('Clipboard module missing setString methods');
      }
    } catch (_unusedErr) {
      throw new Error('Failed to copy to clipboard (native)');
    }
  }
}
