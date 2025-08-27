export interface ClipboardResult {
  success: boolean;
  error?: string;
}

export interface IClipboardAdapter {
  copyToClipboard(text: string): Promise<ClipboardResult>;
  getFromClipboard(): Promise<ClipboardResult & { text?: string }>;
  hasString(): Promise<boolean>;
}
