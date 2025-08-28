// Business Layer - Shared Components
// Exports for external use

// Dependency Container
export { BusinessLayerProvider } from './BusinessLayerProvider';
export { UseCaseFactory } from './UseCaseFactory';

// Session Interfaces and Types
export type { IUserSession, IUserSessionFactory, SessionValidationResult } from './interfaces/IUserSession';
export {
    SESSION_EXPIRY_THRESHOLDS, createSessionFailure, createSessionSuccess, isValidSessionStatus,
    isValidSessionValidationError
} from './types/SessionTypes';
export type {
    SessionEvent, SessionMetadata,
    SessionRefreshResult, SessionResult, SessionStatus,
    SessionValidationError
} from './types/SessionTypes';

// Standard Result Types
export { createFailure, createSuccess, fromLegacyResult, isFailure, isSuccess } from './types/Result';
export type { AsyncResult, Failure, Result, Success } from './types/Result';

