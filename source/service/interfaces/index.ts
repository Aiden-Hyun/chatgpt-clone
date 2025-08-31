/**
 * Service Layer Interfaces - Barrel Export File
 * 
 * This file re-exports all service layer interfaces from their respective files
 * for easy importing throughout the service layer.
 * 
 * Usage:
 * import { ILogger, IValidationResult, WebStorageType } from '@service/interfaces';
 */

// ============================================================================
// CORE INTERFACES - Core service types
// ============================================================================
export * from './core';

// ============================================================================
// STORAGE INTERFACES - Storage domain
// ============================================================================
export * from './storage';

// ============================================================================
// AUTH INTERFACES - Auth validation and error handling
// ============================================================================
export * from './auth';

// ============================================================================
// ALERT INTERFACES - Alert and toast domain
// ============================================================================
export * from './alert';

// ============================================================================
// DOMAIN INTERFACES - Theme, clipboard, navigation
// ============================================================================
export * from './domain';

export * from './language';

// ============================================================================
// SESSION INTERFACES - Session management and validation
// ============================================================================
export * from './session';
