// Auth Feature - Persistence Layer
export { UserRepository } from './repositories/UserRepository';
export { SupabaseAuthAdapter } from './adapters/SupabaseAuthAdapter';
export { UserMapper } from './mappers/UserMapper';

// Types
export type { AuthResult, CreateUserResult } from './repositories/UserRepository';
