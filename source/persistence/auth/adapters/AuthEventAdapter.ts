import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../service/shared/lib/supabase';
import { Logger } from '../../../service/shared/utils/Logger';

import { AuthEventCallback, IAuthEventEmitter, SupabaseUser, Unsubscribe } from '../../interfaces/auth';

export class AuthEventAdapter implements IAuthEventEmitter {
  private activeSubscriptions: Set<() => void> = new Set();

  /**
   * Subscribe to all auth state changes from Supabase
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function
   */
  subscribeToAuthChanges(callback: AuthEventCallback): Unsubscribe {
    try {
      Logger.info('AuthEventAdapter: Subscribing to auth state changes');

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          Logger.info('AuthEventAdapter: Auth state changed', { 
            event, 
            hasSession: !!session,
            userId: session?.user?.id 
          });

          // Map Supabase events to our internal events
          let mappedEvent = event;
          switch (event) {
            case 'INITIAL_SESSION':
              // Ignore INITIAL_SESSION events to prevent startup noise and infinite loops
              Logger.info('AuthEventAdapter: Ignoring INITIAL_SESSION event');
              return;
            case 'SIGNED_IN':
              mappedEvent = 'SIGNED_IN';
              break;
            case 'SIGNED_OUT':
              mappedEvent = 'SIGNED_OUT';
              break;
            case 'TOKEN_REFRESHED':
              mappedEvent = 'TOKEN_REFRESHED';
              break;
            case 'USER_UPDATED':
              mappedEvent = 'USER_UPDATED';
              break;
            case 'PASSWORD_RECOVERY':
              // Handle password recovery as user update
              mappedEvent = 'USER_UPDATED';
              break;
            default:
              Logger.warn('AuthEventAdapter: Unknown auth event', { event });
              return;
          }

          try {
            callback(mappedEvent, session);
          } catch (error) {
            Logger.error('AuthEventAdapter: Error in auth callback', { error, event });
          }
        }
      );

      const unsubscribe = () => {
        try {
          subscription.unsubscribe();
          this.activeSubscriptions.delete(unsubscribe);
          Logger.info('AuthEventAdapter: Unsubscribed from auth state changes');
        } catch (error) {
          Logger.error('AuthEventAdapter: Error unsubscribing from auth changes', { error });
        }
      };

      this.activeSubscriptions.add(unsubscribe);
      Logger.info('AuthEventAdapter: Successfully subscribed to auth state changes');

      return unsubscribe;

    } catch (error) {
      Logger.error('AuthEventAdapter: Failed to subscribe to auth state changes', { error });
      return () => {}; // Return no-op function on error
    }
  }

  /**
   * Subscribe specifically to sign-in events
   * @param callback Function to call when user signs in
   * @returns Unsubscribe function
   */
  onSignIn(callback: (session: Session) => void): Unsubscribe {
    return this.subscribeToAuthChanges((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          callback(session);
        } catch (error) {
          Logger.error('AuthEventAdapter: Error in sign-in callback', { error });
        }
      }
    });
  }

  /**
   * Subscribe specifically to sign-out events
   * @param callback Function to call when user signs out
   * @returns Unsubscribe function
   */
  onSignOut(callback: () => void): Unsubscribe {
    return this.subscribeToAuthChanges((event, _unusedSession) => {
      if (event === 'SIGNED_OUT') {
        try {
          callback();
        } catch (error) {
          Logger.error('AuthEventAdapter: Error in sign-out callback', { error });
        }
      }
    });
  }

  /**
   * Subscribe specifically to token refresh events
   * @param callback Function to call when token is refreshed
   * @returns Unsubscribe function
   */
  onTokenRefresh(callback: (session: Session) => void): Unsubscribe {
    return this.subscribeToAuthChanges((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        try {
          callback(session);
        } catch (error) {
          Logger.error('AuthEventAdapter: Error in token refresh callback', { error });
        }
      }
    });
  }

  /**
   * Subscribe specifically to user update events
   * @param callback Function to call when user data is updated
   * @returns Unsubscribe function
   */
  onUserUpdate(callback: (session: Session) => void): Unsubscribe {
    return this.subscribeToAuthChanges((event, session) => {
      if (event === 'USER_UPDATED' && session) {
        try {
          callback(session);
        } catch (error) {
          Logger.error('AuthEventAdapter: Error in user update callback', { error });
        }
      }
    });
  }

  /**
   * Clean up all active subscriptions
   * Call this when the adapter is being destroyed
   */
  cleanup(): void {
    Logger.info('AuthEventAdapter: Cleaning up subscriptions', { 
      count: this.activeSubscriptions.size 
    });

    for (const unsubscribe of this.activeSubscriptions) {
      try {
        unsubscribe();
      } catch (error) {
        Logger.error('AuthEventAdapter: Error during cleanup', { error });
      }
    }

    this.activeSubscriptions.clear();
    Logger.info('AuthEventAdapter: Cleanup completed');
  }

  /**
   * Get the current session from Supabase
   * @returns Current session or null
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        Logger.error('AuthEventAdapter: Error getting current session', { error });
        return null;
      }

      return session;
    } catch (error) {
      Logger.error('AuthEventAdapter: Failed to get current session', { error });
      return null;
    }
  }

  /**
   * Get the current user from Supabase
   * @returns Current user or null
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        Logger.error('AuthEventAdapter: Error getting current user', { error });
        return null;
      }

      return user;
    } catch (error) {
      Logger.error('AuthEventAdapter: Failed to get current user', { error });
      return null;
    }
  }
}
