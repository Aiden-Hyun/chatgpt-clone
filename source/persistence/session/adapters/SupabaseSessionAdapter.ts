import { supabase } from '../../../service/shared/lib/supabase';
import { SupabaseSession } from '../../interfaces/auth';

export interface SupabaseSessionResult {
  success: boolean;
  session?: SupabaseSession;
  error?: string;
}

/**
 * Adapter for Supabase session operations
 * Integrates with existing /src auth context patterns
 */
export class SupabaseSessionAdapter {
  async getCurrentSession(): Promise<SupabaseSessionResult> {
    try {
      console.log('[SupabaseSessionAdapter] Getting current session from Supabase');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[SupabaseSessionAdapter] Failed to get session:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseSessionAdapter] Session retrieved:', { hasSession: !!data.session });
      return { success: true, session: data.session };
    } catch (error) {
      console.error('[SupabaseSessionAdapter] Unexpected error getting session:', error);
      return { success: false, error: 'Failed to get session' };
    }
  }

  async refreshSession(refreshToken?: string): Promise<SupabaseSessionResult> {
    try {
      console.log('[SupabaseSessionAdapter] Refreshing session');
      
      let result;
      
      if (refreshToken) {
        // Refresh with specific token
        result = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      } else {
        // Refresh current session
        result = await supabase.auth.refreshSession();
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error('[SupabaseSessionAdapter] Session refresh failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseSessionAdapter] Session refreshed successfully');
      return { success: true, session: data.session };
    } catch (error) {
      console.error('[SupabaseSessionAdapter] Unexpected error refreshing session:', error);
      return { success: false, error: 'Failed to refresh session' };
    }
  }

  async signOut(): Promise<SupabaseSessionResult> {
    try {
      console.log('[SupabaseSessionAdapter] Signing out from Supabase');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[SupabaseSessionAdapter] Signout failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseSessionAdapter] Signout successful');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseSessionAdapter] Unexpected error during signout:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }

  async getUser(): Promise<SupabaseSessionResult> {
    try {
      console.log('[SupabaseSessionAdapter] Getting current user from Supabase');
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('[SupabaseSessionAdapter] Failed to get user:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseSessionAdapter] User retrieved:', { hasUser: !!data.user });
      return { success: true, session: { user: data.user } };
    } catch (error) {
      console.error('[SupabaseSessionAdapter] Unexpected error getting user:', error);
      return { success: false, error: 'Failed to get user' };
    }
  }

  /**
   * Subscribe to auth state changes
   * Returns a cleanup function
   */
  onAuthStateChange(callback: (event: string, session: SupabaseSession | null) => void): () => void {
    console.log('[SupabaseSessionAdapter] Setting up auth state change listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SupabaseSessionAdapter] Auth state change:', { event, hasSession: !!session });
      callback(event, session);
    });

    return () => {
      console.log('[SupabaseSessionAdapter] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }
}
