import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Logger } from '../../../service/shared/utils/Logger';
import { SecureStoreOptions } from '../../interfaces/shared';

export interface SecureStorageOptions {
  requireAuthentication?: boolean;
  accessGroup?: string;
  keychainService?: string;
}

export class SecureStorageAdapter {
  private static readonly KEY_REGISTRY = 'secure_storage_keys';
  private static readonly DEFAULT_OPTIONS: SecureStorageOptions = {
    requireAuthentication: false
  };

  /**
   * Store an item securely
   * @param key Storage key
   * @param value Value to store
   * @param options Storage options
   */
  async setItem(
    key: string, 
    value: string, 
    options: SecureStorageOptions = SecureStorageAdapter.DEFAULT_OPTIONS
  ): Promise<void> {
    try {
      Logger.info('SecureStorageAdapter: Setting item', { key, platform: Platform.OS });

      if (Platform.OS === 'web') {
        // On web, use localStorage with base64 encoding for basic obfuscation
        // Note: This is not truly secure, but provides basic protection
        const encodedValue = btoa(value);
        localStorage.setItem(key, encodedValue);
        await this.addKeyToRegistry(key);
      } else {
        // On native platforms, use Expo SecureStore
        const storeOptions: SecureStoreOptions = {
          requireAuthentication: options.requireAuthentication || false
        };

        if (options.keychainService && Platform.OS === 'ios') {
          storeOptions.keychainService = options.keychainService;
        }

        if (options.accessGroup && Platform.OS === 'ios') {
          storeOptions.accessGroup = options.accessGroup;
        }

        await SecureStore.setItemAsync(key, value, storeOptions);
        await this.addKeyToRegistry(key);
      }

      Logger.info('SecureStorageAdapter: Item stored successfully', { key });
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to store item', { key, error });
      throw new Error(`Failed to store secure item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve an item securely
   * @param key Storage key
   * @param options Storage options
   * @returns Stored value or null if not found
   */
  async getItem(
    key: string, 
    options: SecureStorageOptions = SecureStorageAdapter.DEFAULT_OPTIONS
  ): Promise<string | null> {
    try {
      Logger.info('SecureStorageAdapter: Getting item', { key, platform: Platform.OS });

      if (Platform.OS === 'web') {
        // On web, retrieve from localStorage and decode
        const encodedValue = localStorage.getItem(key);
        if (!encodedValue) {
          return null;
        }

        try {
          return atob(encodedValue);
        } catch (_unusedDecodeError) {
          Logger.warn('SecureStorageAdapter: Failed to decode value, returning raw value', { key });
          return encodedValue;
        }
      } else {
        // On native platforms, use Expo SecureStore
        const storeOptions: SecureStoreOptions = {
          requireAuthentication: options.requireAuthentication || false
        };

        if (options.keychainService && Platform.OS === 'ios') {
          storeOptions.keychainService = options.keychainService;
        }

        const value = await SecureStore.getItemAsync(key, storeOptions);
        return value;
      }
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to retrieve item', { key, error });
      
      // If the error is due to authentication requirement, re-throw it
      if (error instanceof Error && error.message.includes('authentication')) {
        throw error;
      }
      
      // For other errors, return null (item not found or corrupted)
      return null;
    }
  }

  /**
   * Remove an item from secure storage
   * @param key Storage key
   * @param options Storage options
   */
  async removeItem(
    key: string, 
    options: SecureStorageOptions = SecureStorageAdapter.DEFAULT_OPTIONS
  ): Promise<void> {
    try {
      Logger.info('SecureStorageAdapter: Removing item', { key, platform: Platform.OS });

      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        await this.removeKeyFromRegistry(key);
      } else {
        const storeOptions: SecureStoreOptions = {
          requireAuthentication: options.requireAuthentication || false
        };

        if (options.keychainService && Platform.OS === 'ios') {
          storeOptions.keychainService = options.keychainService;
        }

        await SecureStore.deleteItemAsync(key, storeOptions);
        await this.removeKeyFromRegistry(key);
      }

      Logger.info('SecureStorageAdapter: Item removed successfully', { key });
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to remove item', { key, error });
      // Don't throw on removal errors - the item might not exist
    }
  }

  /**
   * Check if an item exists in secure storage
   * @param key Storage key
   * @returns true if item exists
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to check item existence', { key, error });
      return false;
    }
  }

  /**
   * Clear all items stored by this adapter
   */
  async clear(): Promise<void> {
    try {
      Logger.info('SecureStorageAdapter: Clearing all items');

      const keys = await this.getAllKeys();
      
      for (const key of keys) {
        await this.removeItem(key);
      }

      // Clear the registry itself
      if (Platform.OS === 'web') {
        localStorage.removeItem(SecureStorageAdapter.KEY_REGISTRY);
      } else {
        try {
          await SecureStore.deleteItemAsync(SecureStorageAdapter.KEY_REGISTRY);
        } catch (_unusedError) {
          // Registry might not exist, ignore error
        }
      }

      Logger.info('SecureStorageAdapter: All items cleared successfully');
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to clear items', { error });
      throw new Error(`Failed to clear secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all keys managed by this adapter
   * @returns Array of storage keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      let registryData: string | null;

      if (Platform.OS === 'web') {
        registryData = localStorage.getItem(SecureStorageAdapter.KEY_REGISTRY);
      } else {
        registryData = await SecureStore.getItemAsync(SecureStorageAdapter.KEY_REGISTRY);
      }

      if (!registryData) {
        return [];
      }

      return JSON.parse(registryData);
    } catch (error) {
      Logger.error('SecureStorageAdapter: Failed to get keys', { error });
      return [];
    }
  }

  /**
   * Add a key to the registry for cleanup purposes
   * @param key Storage key to register
   */
  private async addKeyToRegistry(key: string): Promise<void> {
    try {
      const existingKeys = await this.getAllKeys();
      
      if (!existingKeys.includes(key)) {
        const updatedKeys = [...existingKeys, key];
        const registryData = JSON.stringify(updatedKeys);

        if (Platform.OS === 'web') {
          localStorage.setItem(SecureStorageAdapter.KEY_REGISTRY, registryData);
        } else {
          await SecureStore.setItemAsync(SecureStorageAdapter.KEY_REGISTRY, registryData);
        }
      }
    } catch (error) {
      Logger.warn('SecureStorageAdapter: Failed to update key registry', { key, error });
      // Don't throw - registry is for cleanup only
    }
  }

  /**
   * Remove a key from the registry
   * @param key Storage key to unregister
   */
  private async removeKeyFromRegistry(key: string): Promise<void> {
    try {
      const existingKeys = await this.getAllKeys();
      const updatedKeys = existingKeys.filter(k => k !== key);
      
      if (updatedKeys.length !== existingKeys.length) {
        const registryData = JSON.stringify(updatedKeys);

        if (Platform.OS === 'web') {
          if (updatedKeys.length === 0) {
            localStorage.removeItem(SecureStorageAdapter.KEY_REGISTRY);
          } else {
            localStorage.setItem(SecureStorageAdapter.KEY_REGISTRY, registryData);
          }
        } else {
          if (updatedKeys.length === 0) {
            await SecureStore.deleteItemAsync(SecureStorageAdapter.KEY_REGISTRY);
          } else {
            await SecureStore.setItemAsync(SecureStorageAdapter.KEY_REGISTRY, registryData);
          }
        }
      }
    } catch (error) {
      Logger.warn('SecureStorageAdapter: Failed to update key registry', { key, error });
      // Don't throw - registry is for cleanup only
    }
  }

  /**
   * Get storage statistics
   * @returns Storage usage information
   */
  async getStorageInfo(): Promise<{
    totalKeys: number;
    keys: string[];
    platform: string;
  }> {
    const keys = await this.getAllKeys();
    
    return {
      totalKeys: keys.length,
      keys,
      platform: Platform.OS
    };
  }
}
