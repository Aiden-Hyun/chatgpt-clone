import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * A lightweight storage wrapper that delegates to `sessionStorage` on web
 * and `AsyncStorage` on native. All methods are asynchronous to provide
 * a unified API.
 */
const mobileStorage = {
  /**
   * Persist a key/value pair
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[mobileStorage] Failed to set key "${key}":`, e);
    }
  },

  /**
   * Retrieve a value for the given key. Returns `null` if not found.
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`[mobileStorage] Failed to get key "${key}":`, e);
      return null;
    }
  },

  /**
   * Remove a stored value.
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[mobileStorage] Failed to remove key "${key}":`, e);
    }
  },
};

export default mobileStorage;
