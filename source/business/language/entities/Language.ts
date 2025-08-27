/**
 * Language entity representing a supported language in the application
 */
export class Language {
  private readonly _code: string;
  private readonly _name: string;
  
  constructor(code: string, name: string) {
    this._code = code;
    this._name = name;
  }
  
  /**
   * Get the language code (e.g., 'en', 'es', 'ko')
   */
  public getCode(): string {
    return this._code;
  }
  
  /**
   * Get the display name of the language (e.g., 'English', 'Español', '한국어')
   */
  public getName(): string {
    return this._name;
  }
  
  /**
   * Create a Language entity from a plain object
   */
  public static fromObject(obj: { code: string; name: string }): Language {
    return new Language(obj.code, obj.name);
  }
  
  /**
   * Convert the Language entity to a plain object
   */
  public toObject(): { code: string; name: string } {
    return {
      code: this._code,
      name: this._name,
    };
  }
}
