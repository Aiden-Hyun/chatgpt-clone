import { UserSession } from '../../interfaces/session';

/**
 * SessionState entity - Single source of truth for session state in the business layer
 * Provides change detection and state management without external dependencies
 */
export class SessionState {
  private currentSession: UserSession | null = null;
  private isLoadingState: boolean = true;

  constructor(initialSession?: UserSession | null, initialLoading: boolean = true) {
    this.currentSession = initialSession || null;
    this.isLoadingState = initialLoading;
  }

  /**
   * Get the current session
   */
  getSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Get the current loading state
   */
  isLoading(): boolean {
    return this.isLoadingState;
  }

  /**
   * Update the session state
   * Returns true if the state actually changed, false if it's identical
   */
  updateSession(newSession: UserSession | null): boolean {
    const hasChanged = !this.areSessionsEqual(this.currentSession, newSession);
    
    if (hasChanged) {
      this.currentSession = newSession;
    }
    
    return hasChanged;
  }

  /**
   * Update the loading state
   * Returns true if the state actually changed
   */
  updateLoading(loading: boolean): boolean {
    const hasChanged = this.isLoadingState !== loading;
    
    if (hasChanged) {
      this.isLoadingState = loading;
    }
    
    return hasChanged;
  }

  /**
   * Check if the current session is valid (exists and not expired)
   */
  hasValidSession(): boolean {
    if (!this.currentSession) {
      return false;
    }
    
    return this.currentSession.isActive && !this.currentSession.isExpired();
  }

  /**
   * Get the current user ID if session exists
   */
  getCurrentUserId(): string | null {
    return this.currentSession?.userId || null;
  }

  /**
   * Compare two sessions for equality
   * Private method used for change detection
   */
  private areSessionsEqual(session1: UserSession | null, session2: UserSession | null): boolean {
    // Both null
    if (!session1 && !session2) {
      return true;
    }
    
    // One null, one not
    if (!session1 || !session2) {
      return false;
    }
    
    // Compare core properties
    try {
      return (
        session1.userId === session2.userId &&
        session1.isActive === session2.isActive &&
        session1.expiresAt.getTime() === session2.expiresAt.getTime() &&
        session1.createdAt.getTime() === session2.createdAt.getTime() &&
        JSON.stringify(session1.permissions) === JSON.stringify(session2.permissions)
      );
    } catch (error) {
      // If comparison fails, assume they're different
      return false;
    }
  }

  /**
   * Create a copy of the current state
   * Useful for testing or state snapshots
   */
  clone(): SessionState {
    return new SessionState(this.currentSession, this.isLoadingState);
  }

  /**
   * Reset the state to initial values
   */
  reset(): void {
    this.currentSession = null;
    this.isLoadingState = true;
  }
}
