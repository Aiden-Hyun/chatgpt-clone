export interface ClipboardResult {
  success: boolean;
  error?: string;
}

export class ClipboardAdapter {
  async copyToClipboard(text: string): Promise<ClipboardResult> {
    try {
      // Mock implementation - in real app, this would use Expo Clipboard
      console.log('Mock: Copying to clipboard:', text);
      
      // Simulate clipboard operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to copy to clipboard'
      };
    }
  }

  async getFromClipboard(): Promise<ClipboardResult & { text?: string }> {
    try {
      // Mock implementation - in real app, this would use Expo Clipboard
      console.log('Mock: Getting from clipboard');
      
      // Simulate clipboard operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true,
        text: 'Mock clipboard content'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get from clipboard'
      };
    }
  }

  async hasString(): Promise<boolean> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 50));
      return Math.random() > 0.5; // Random boolean for demo
    } catch (error) {
      return false;
    }
  }
}
