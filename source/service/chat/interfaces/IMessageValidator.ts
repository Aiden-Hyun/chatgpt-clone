// Service layer interface for message validation
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IMessageValidator {
  validateContent(content: string): ValidationResult;
  validateRole(role: string): ValidationResult;
  validateMetadata(metadata: any): ValidationResult;
}
