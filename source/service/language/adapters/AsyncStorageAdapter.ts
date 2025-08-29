import AsyncStorage from '@react-native-async-storage/async-storage';

import { Result } from '../../../business/types/shared/Result';
import { ILogger } from '../../shared/interfaces/ILogger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';

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
  public async getValue(key: string): Promise<Result<string | null>> {
    try {
      const value = await AsyncStorage.getItem(key);
      return Result.success(value);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.getValue error', { key, error });
      return Result.failure('Failed to get value from storage');
    }
  }
  
  /**
   * Set a value in AsyncStorage
   * @param key The storage key
   * @param value The value to store
   * @returns A Result indicating success or failure
   */
  public async setValue(key: string, value: string): Promise<Result<void>> {
    try {
      await AsyncStorage.setItem(key, value);
      return Result.success(undefined);
    } catch (error) {
      this.logger.error('AsyncStorageAdapter.setValue error', { key, error });
      return Result.failure('Failed to save value to storage');
    }
  }
}