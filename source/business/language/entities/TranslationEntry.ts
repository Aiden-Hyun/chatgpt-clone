/**
 * TranslationEntry entity representing a single translation key-value pair
 */
export class TranslationEntry {
  private readonly _key: string;
  private readonly _value: string;
  
  constructor(key: string, value: string) {
    this._key = key;
    this._value = value;
  }
  
  /**
   * Get the translation key
   */
  public getKey(): string {
    return this._key;
  }
  
  /**
   * Get the translated value
   */
  public getValue(): string {
    return this._value;
  }
  
  /**
   * Create a TranslationEntry from a key-value pair
   */
  public static fromKeyValue(key: string, value: string): TranslationEntry {
    return new TranslationEntry(key, value);
  }
}
