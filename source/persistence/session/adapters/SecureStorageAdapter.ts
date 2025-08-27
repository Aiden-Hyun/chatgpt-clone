import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Real implementation using Expo SecureStore for native and localStorage for web
 * Follows security best practices for sensitive data storage
 * Note: SecureStore is only available on native platforms, falls back to localStorage on web
 */
export class SecureStorageAdapter {
  private readonly KEYS_STORAGE_KEY = '__secure_storage_keys__';

  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log('[SecureStorageAdapter] Setting secure item:', { key, valueLength: value.length });
      
      if (Platform.OS === 'web') {
        // On web, use localStorage (less secure but functional)
        localStorage.setItem(key, value);
        await this.addKeyToRegistry(key);
      } else {
        // On native, use Expo SecureStore
        await SecureStore.setItemAsync(key, value);
        await this.addKeyToRegistry(key);
      }
      
      console.log('[SecureStorageAdapter] Secure item set successfully:', { key });
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to set secure item:', { key, error });
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      console.log('[SecureStorageAdapter] Getting secure item:', { key });
      
      let value: string | null;
      
      if (Platform.OS === 'web') {
        value = localStorage.getItem(key);
      } else {
        value = await SecureStore.getItemAsync(key);
      }
      
      console.log('[SecureStorageAdapter] Secure item retrieved:', { key, hasValue: !!value });
      return value;
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to get secure item:', { key, error });
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      console.log('[SecureStorageAdapter] Removing secure item:', { key });
      
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        await this.removeKeyFromRegistry(key);
      } else {
        await SecureStore.deleteItemAsync(key);
        await this.removeKeyFromRegistry(key);
      }
      
      console.log('[SecureStorageAdapter] Secure item removed successfully:', { key });
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to remove secure item:', { key, error });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('[SecureStorageAdapter] Clearing all secure items');
      
      const keys = await this.getAllKeys();
      await this.multiRemove(keys);
      
      // Clear the keys registry itself
      if (Platform.OS === 'web') {
        localStorage.removeItem(this.KEYS_STORAGE_KEY);
      } else {
        try {
          await SecureStore.deleteItemAsync(this.KEYS_STORAGE_KEY);
        } catch {
          // Keys registry might not exist, ignore error
        }
      }
      
      console.log('[SecureStorageAdapter] All secure items cleared successfully');
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to clear secure storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      console.log('[SecureStorageAdapter] Getting all secure keys');
      
      let keysData: string | null;
      
      if (Platform.OS === 'web') {
        keysData = localStorage.getItem(this.KEYS_STORAGE_KEY);
      } else {
        keysData = await SecureStore.getItemAsync(this.KEYS_STORAGE_KEY);
      }
      
      const keys = keysData ? JSON.parse(keysData) : [];
      console.log('[SecureStorageAdapter] Secure keys retrieved:', { count: keys.length });
      return keys;
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to get all secure keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      console.log('[SecureStorageAdapter] Multi-getting secure items:', { keys });
      
      const values: Array<[string, string | null]> = [];
      
      // SecureStore doesn't have multiGet, so we do individual gets
      for (const key of keys) {
        const value = await this.getItem(key);
        values.push([key, value]);
      }
      
      console.log('[SecureStorageAdapter] Secure multi-get completed:', { count: values.length });
      return values;
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to multi-get secure items:', { keys, error });
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      console.log('[SecureStorageAdapter] Multi-setting secure items:', { count: keyValuePairs.length });
      
      // SecureStore doesn't have multiSet, so we do individual sets
      for (const [key, value] of keyValuePairs) {
        await this.setItem(key, value);
      }
      
      console.log('[SecureStorageAdapter] Secure multi-set completed successfully');
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to multi-set secure items:', { error });
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      console.log('[SecureStorageAdapter] Multi-removing secure items:', { keys });
      
      // SecureStore doesn't have multiRemove, so we do individual removes
      for (const key of keys) {
        await this.removeItem(key);
      }
      
      console.log('[SecureStorageAdapter] Secure multi-remove completed successfully');
    } catch (error) {
      console.error('[SecureStorageAdapter] Failed to multi-remove secure items:', { keys, error });
      throw error;
    }
  }

  // Helper method to check if secure storage is available
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__test_secure_storage__';
      const testValue = 'test_value';
      
      await this.setItem(testKey, testValue);
      const retrieved = await this.getItem(testKey);
      await this.removeItem(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      console.error('[SecureStorageAdapter] Secure storage is not available:', error);
      return false;
    }
  }

  // Private helper to maintain keys registry (since SecureStore doesn't have getAllKeys)
  private async addKeyToRegistry(key: string): Promise<void> {
    try {
      if (key === this.KEYS_STORAGE_KEY) return; // Don't track the registry key itself
      
      const keys = await this.getAllKeys();
      if (!keys.includes(key)) {
        keys.push(key);
        const keysData = JSON.stringify(keys);
        
        if (Platform.OS === 'web') {
          localStorage.setItem(this.KEYS_STORAGE_KEY, keysData);
        } else {
          await SecureStore.setItemAsync(this.KEYS_STORAGE_KEY, keysData);
        }
      }
    } catch (error) {
      console.warn('[SecureStorageAdapter] Failed to add key to registry:', { key, error });
    }
  }

  private async removeKeyFromRegistry(key: string): Promise<void> {
    try {
      if (key === this.KEYS_STORAGE_KEY) return; // Don't track the registry key itself
      
      const keys = await this.getAllKeys();
      const updatedKeys = keys.filter(k => k !== key);
      const keysData = JSON.stringify(updatedKeys);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(this.KEYS_STORAGE_KEY, keysData);
      } else {
        await SecureStore.setItemAsync(this.KEYS_STORAGE_KEY, keysData);
      }
    } catch (error) {
      console.warn('[SecureStorageAdapter] Failed to remove key from registry:', { key, error });
    }
  }
}
