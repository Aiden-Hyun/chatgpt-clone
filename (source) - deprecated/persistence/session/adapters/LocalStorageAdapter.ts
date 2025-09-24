import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Real implementation using React Native AsyncStorage and Web localStorage
 * Follows the patterns from /src/shared/lib/mobileStorage.ts
 */
export class LocalStorageAdapter {
  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log('[LocalStorageAdapter] Setting item:', { key, valueLength: value.length });
      
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
      
      console.log('[LocalStorageAdapter] Item set successfully:', { key });
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to set item:', { key, error });
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      console.log('[LocalStorageAdapter] Getting item:', { key });
      
      let value: string | null;
      
      if (Platform.OS === 'web') {
        value = localStorage.getItem(key);
      } else {
        value = await AsyncStorage.getItem(key);
      }
      
      console.log('[LocalStorageAdapter] Item retrieved:', { key, hasValue: !!value });
      return value;
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to get item:', { key, error });
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      console.log('[LocalStorageAdapter] Removing item:', { key });
      
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      
      console.log('[LocalStorageAdapter] Item removed successfully:', { key });
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to remove item:', { key, error });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('[LocalStorageAdapter] Clearing all items');
      
      if (Platform.OS === 'web') {
        localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
      
      console.log('[LocalStorageAdapter] All items cleared successfully');
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to clear storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      console.log('[LocalStorageAdapter] Getting all keys');
      
      let keys: string[];
      
      if (Platform.OS === 'web') {
        keys = Object.keys(localStorage);
      } else {
        keys = await AsyncStorage.getAllKeys();
      }
      
      console.log('[LocalStorageAdapter] Keys retrieved:', { count: keys.length });
      return keys;
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to get all keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      console.log('[LocalStorageAdapter] Multi-getting items:', { keys });
      
      let values: [string, string | null][];
      
      if (Platform.OS === 'web') {
        values = keys.map(key => [key, localStorage.getItem(key)]);
      } else {
        values = await AsyncStorage.multiGet(keys);
      }
      
      console.log('[LocalStorageAdapter] Multi-get completed:', { count: values.length });
      return values;
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to multi-get:', { keys, error });
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      console.log('[LocalStorageAdapter] Multi-setting items:', { count: keyValuePairs.length });
      
      if (Platform.OS === 'web') {
        keyValuePairs.forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      } else {
        await AsyncStorage.multiSet(keyValuePairs);
      }
      
      console.log('[LocalStorageAdapter] Multi-set completed successfully');
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to multi-set:', { error });
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      console.log('[LocalStorageAdapter] Multi-removing items:', { keys });
      
      if (Platform.OS === 'web') {
        keys.forEach(key => {
          localStorage.removeItem(key);
        });
      } else {
        await AsyncStorage.multiRemove(keys);
      }
      
      console.log('[LocalStorageAdapter] Multi-remove completed successfully');
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to multi-remove:', { keys, error });
      throw error;
    }
  }
}
