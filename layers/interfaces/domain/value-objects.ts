// Value objects for domain concepts
export interface MessageId {
  value: string;
  isGenerated(): boolean;
  isDatabaseId(): boolean;
  toString(): string;
}

export interface RoomId {
  value: number;
  isTemporary(): boolean;
  isPersistent(): boolean;
  toString(): string;
}

export interface UserId {
  value: string;
  isValid(): boolean;
  toString(): string;
}

export interface Email {
  value: string;
  isValid(): boolean;
  getDomain(): string;
  getLocalPart(): string;
  toString(): string;
}

export interface Password {
  value: string;
  isValid(): boolean;
  getStrength(): PasswordStrength;
  meetsRequirements(): boolean;
  toString(): string;
}

export interface ThemeId {
  value: string;
  isDefault(): boolean;
  isCustom(): boolean;
  toString(): string;
}

export interface LanguageCode {
  value: string;
  isValid(): boolean;
  getLanguage(): string;
  getRegion(): string | null;
  toString(): string;
}

export interface ModelName {
  value: string;
  getProvider(): string;
  getVersion(): string;
  supportsFeature(feature: string): boolean;
  toString(): string;
}

export interface Timestamp {
  value: Date;
  isInPast(): boolean;
  isInFuture(): boolean;
  isToday(): boolean;
  isYesterday(): boolean;
  getAgeInMinutes(): number;
  getAgeInHours(): number;
  getAgeInDays(): number;
  toString(): string;
}

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  hasNext(): boolean;
  hasPrevious(): boolean;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
  toString(): string;
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
  toString(): string;
}
