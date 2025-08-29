/**
 * Mapper Types
 * 
 * Types for data mapping between layers in the persistence layer.
 */

/**
 * Base mapper interface for converting between domain and persistence models
 */
export interface IMapper<TDomain, TPersistence> {
  /**
   * Convert from domain model to persistence model
   */
  toPersistence(domain: TDomain): TPersistence;
  
  /**
   * Convert from persistence model to domain model
   */
  toDomain(persistence: TPersistence): TDomain;
  
  /**
   * Convert array from domain models to persistence models
   */
  toPersistenceArray(domains: TDomain[]): TPersistence[];
  
  /**
   * Convert array from persistence models to domain models
   */
  toDomainArray(persistences: TPersistence[]): TDomain[];
}

/**
 * Mapper validation result
 */
export interface MapperValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Mapper configuration
 */
export interface MapperConfig {
  strictMode: boolean;
  validateOnMap: boolean;
  logMappingErrors: boolean;
}

/**
 * Mapping context for additional information during mapping
 */
export interface MappingContext {
  userId?: string;
  timestamp?: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}
