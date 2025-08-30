import AsyncStorage from '@react-native-async-storage/async-storage';

import { ILogger, IStorageAdapter, createFailure, createSuccess } from '../../interfaces';

/**
 * AsyncStorage implementation of the IStorageAdapter interface
 */
export class AsyncStorageAdapter implements IStorageAdapter {
  private readonly logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }
  
  /**
   * Get a value from AsyncStorage by key
   * @param key The storage key
   * @returns A Result containing the value or an error
   */
  public async get<T>(key: string): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
      const value = await AsyncStorage.getItem(key);
      return createSuccess(value as T);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.get error', { key, error });
      return createFailure('Failed to get value from storage');
    }
  }
  
  /**
   * Set a value in AsyncStorage
   * @param key The storage key
   * @param value The value to store
   * @returns A Result indicating success or failure
   */
  public async set<T>(key: string, value: T): Promise<{ success: true; data: void } | { success: false; error: string }> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return createSuccess(undefined);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.set error', { key, error });
      return createFailure('Failed to save value to storage');
    }
  }
  
  /**
   * Remove a value from AsyncStorage
   * @param key The storage key
   * @returns A Result indicating success or failure
   */
  public async remove(key: string): Promise<{ success: true; data: void } | { success: false; error: string }> {
    try {
      await AsyncStorage.removeItem(key);
      return createSuccess(undefined);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.remove error', { key, error });
      return createFailure('Failed to remove value from storage');
    }
  }
  
  /**
   * Clear all values from AsyncStorage
   * @returns A Result indicating success or failure
   */
  public async clear(): Promise<{ success: true; data: void } | { success: false; error: string }> {
    try {
      await AsyncStorage.clear();
      return createSuccess(undefined);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.clear error', { error });
      return createFailure('Failed to clear storage');
    }
  }
  
  /**
   * Check if a key exists in AsyncStorage
   * @param key The storage key
   * @returns A Result containing true if the key exists
   */
  public async has(key: string): Promise<{ success: true; data: boolean } | { success: false; error: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const exists = keys.includes(key);
      return createSuccess(exists);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.has error', { key, error });
      return createFailure('Failed to check if key exists');
    }
  }
}