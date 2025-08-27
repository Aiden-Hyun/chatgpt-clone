import { Platform } from 'react-native';

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Real implementation using Expo Clipboard for native and Navigator API for web
 * Follows the patterns from /src/shared/lib/clipboard.ts
 */
import { IClipboardAdapter } from '../../../business/chat/interfaces/IClipboardAdapter';

export class ClipboardAdapter implements IClipboardAdapter {
  async copyToClipboard(text: string): Promise<ClipboardResult> {
    try {
      console.log('[ClipboardAdapter] Copying to clipboard:', { textLength: text.length });
      
      if (!text || text.length === 0) {
        return { success: true }; // Empty text is not an error
      }

      if (Platform.OS === 'web') {
        // Web: Use Navigator Clipboard API with fallback
        try {
          const hasNavigator = typeof navigator !== 'undefined' && !!(navigator as any);
          const isSecure = typeof window !== 'undefined' && (window as any).isSecureContext !== false;
          
          if (hasNavigator && (navigator as any).clipboard && isSecure) {
            await (navigator as any).clipboard.writeText(text);
            console.log('[ClipboardAdapter] Copied to clipboard via Navigator API');
            return { success: true };
          }
        } catch (webError) {
          console.warn('[ClipboardAdapter] Navigator Clipboard API failed, trying fallback:', webError);
        }

        // Fallback: hidden textarea + execCommand('copy')
        try {
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
              console.log('[ClipboardAdapter] Copied to clipboard via execCommand fallback');
              return { success: true };
            } catch (execError) {
              document.body.removeChild(textarea);
              throw execError;
            }
          }
        } catch (fallbackError) {
          console.error('[ClipboardAdapter] Fallback clipboard method failed:', fallbackError);
          return { 
            success: false, 
            error: 'Clipboard API is not available on this browser' 
          };
        }
        
        return { 
          success: false, 
          error: 'Clipboard API is not available' 
        };
      }

      // Native (iOS/Android): Use expo-clipboard
      try {
        const Clipboard = await import('expo-clipboard');
        
        if ((Clipboard as any).setStringAsync) {
          await (Clipboard as any).setStringAsync(text);
        } else if ((Clipboard as any).setString) {
          (Clipboard as any).setString(text);
        } else {
          throw new Error('Clipboard module missing setString methods');
        }
        
        console.log('[ClipboardAdapter] Copied to clipboard via Expo Clipboard');
        return { success: true };
      } catch (nativeError) {
        console.error('[ClipboardAdapter] Native clipboard operation failed:', nativeError);
        return { 
          success: false, 
          error: 'Failed to copy to clipboard (native)' 
        };
      }
    } catch (error) {
      console.error('[ClipboardAdapter] Unexpected clipboard error:', error);
      return {
        success: false,
        error: 'Failed to copy to clipboard'
      };
    }
  }

  async getFromClipboard(): Promise<ClipboardResult & { text?: string }> {
    try {
      console.log('[ClipboardAdapter] Getting from clipboard');
      
      if (Platform.OS === 'web') {
        // Web: Use Navigator Clipboard API
        try {
          const hasNavigator = typeof navigator !== 'undefined' && !!(navigator as any);
          const isSecure = typeof window !== 'undefined' && (window as any).isSecureContext !== false;
          
          if (hasNavigator && (navigator as any).clipboard && isSecure) {
            const text = await (navigator as any).clipboard.readText();
            console.log('[ClipboardAdapter] Retrieved from clipboard via Navigator API');
            return { success: true, text };
          }
        } catch (webError) {
          console.warn('[ClipboardAdapter] Navigator Clipboard API failed:', webError);
        }
        
        return { 
          success: false, 
          error: 'Clipboard reading not supported on this browser' 
        };
      }

      // Native (iOS/Android): Use expo-clipboard
      try {
        const Clipboard = await import('expo-clipboard');
        
        let text: string | null = null;
        
        if ((Clipboard as any).getStringAsync) {
          text = await (Clipboard as any).getStringAsync();
        } else if ((Clipboard as any).getString) {
          text = (Clipboard as any).getString();
        } else {
          throw new Error('Clipboard module missing getString methods');
        }
        
        console.log('[ClipboardAdapter] Retrieved from clipboard via Expo Clipboard');
        return { success: true, text: text || '' };
      } catch (nativeError) {
        console.error('[ClipboardAdapter] Native clipboard reading failed:', nativeError);
        return { 
          success: false, 
          error: 'Failed to read from clipboard (native)' 
        };
      }
    } catch (error) {
      console.error('[ClipboardAdapter] Unexpected clipboard reading error:', error);
      return {
        success: false,
        error: 'Failed to get from clipboard'
      };
    }
  }

  async hasString(): Promise<boolean> {
    try {
      console.log('[ClipboardAdapter] Checking if clipboard has string');
      
      if (Platform.OS === 'web') {
        // Web: Try to read from clipboard to check if it has content
        try {
          const hasNavigator = typeof navigator !== 'undefined' && !!(navigator as any);
          const isSecure = typeof window !== 'undefined' && (window as any).isSecureContext !== false;
          
          if (hasNavigator && (navigator as any).clipboard && isSecure) {
            const text = await (navigator as any).clipboard.readText();
            const hasContent = text && text.trim().length > 0;
            console.log('[ClipboardAdapter] Clipboard has content (web):', hasContent);
            return hasContent;
          }
        } catch (webError) {
          console.warn('[ClipboardAdapter] Cannot check clipboard content on web:', webError);
        }
        
        return false; // Cannot determine on web
      }

      // Native (iOS/Android): Use expo-clipboard
      try {
        const Clipboard = await import('expo-clipboard');
        
        let text: string | null = null;
        
        if ((Clipboard as any).getStringAsync) {
          text = await (Clipboard as any).getStringAsync();
        } else if ((Clipboard as any).getString) {
          text = (Clipboard as any).getString();
        } else {
          throw new Error('Clipboard module missing getString methods');
        }
        
        const hasContent = text && text.trim().length > 0;
        console.log('[ClipboardAdapter] Clipboard has content (native):', hasContent);
        return hasContent;
      } catch (nativeError) {
        console.error('[ClipboardAdapter] Native clipboard check failed:', nativeError);
        return false;
      }
    } catch (error) {
      console.error('[ClipboardAdapter] Unexpected clipboard check error:', error);
      return false;
    }
  }
}
