import { Platform } from "react-native";

/**
 * Cross-platform clipboard helper.
 * - Web: prefers Navigator Clipboard API, falls back to hidden textarea.
 * - Native: uses expo-clipboard.
 */
export async function copy(text: string): Promise<void> {
  if (!text || text.length === 0) {
    return;
  }

  if (Platform.OS === "web") {
    try {
      const hasNavigator =
        typeof navigator !== "undefined" && !!(navigator as any);
      const isSecure =
        typeof window !== "undefined" &&
        (window as any).isSecureContext !== false;
      if (hasNavigator && (navigator as any).clipboard && isSecure) {
        await (navigator as any).clipboard.writeText(text);
        return;
      }
    } catch {}

    try {
      // Fallback: hidden textarea + execCommand('copy')
      if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
          document.body.removeChild(textarea);
          return;
        } catch {
          document.body.removeChild(textarea);
          throw new Error("Failed to copy to clipboard");
        }
      }
    } catch {
      throw new Error("Failed to copy to clipboard");
    }
    throw new Error("Clipboard API is not available");
  }

  // Native (iOS/Android)
  try {
    const Clipboard = await import("expo-clipboard");
    if ((Clipboard as any).setStringAsync) {
      await (Clipboard as any).setStringAsync(text);
    } else if ((Clipboard as any).setString) {
      (Clipboard as any).setString(text);
    } else {
      throw new Error("Clipboard module missing setString methods");
    }
  } catch {
    throw new Error("Failed to copy to clipboard (native)");
  }
}
