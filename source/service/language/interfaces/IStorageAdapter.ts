import { Result } from '../../../business/shared/Result';

/**
 * Interface for storage operations related to language settings
 */
export interface IStorageAdapter {
  /**
   * Get a value from storage by key
   * @param key The storage key
   * @returns A Result containing the value or an error
   */
  getValue(key: string): Promise<Result<string | null>>;
  
  /**
   * Set a value in storage
   * @param key The storage key
   * @param value The value to store
   * @returns A Result indicating success or failure
   */
  setValue(key: string, value: string): Promise<Result<void>>;
}
