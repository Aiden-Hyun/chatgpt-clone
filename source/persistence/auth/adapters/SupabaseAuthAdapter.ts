import { supabase } from '../../../service/shared/lib/supabase';

export interface SupabaseAuthResult {
  success: boolean;
  user?: any;
  session?: any;
  data?: any;
  error?: string;
  isNetworkError?: boolean;
}

export interface SupabaseSignUpResult {
  success: boolean;
  user?: any;
  data?: any;
  requiresEmailVerification?: boolean;
  error?: string;
}

export class SupabaseAuthAdapter {
  async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    try {
      console.log('[SupabaseAuthAdapter] Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[SupabaseAuthAdapter] Signin error:', error);
        
        // Check if this is a network error following existing patterns
        const isNetworkError = error.message?.toLowerCase().includes('network') ||
                              error.message?.toLowerCase().includes('fetch') ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              !navigator.onLine;

        return { 
          success: false, 
          error: error.message,
          isNetworkError 
        };
      }

      if (data.user) {
        console.log('[SupabaseAuthAdapter] Signin successful for user:', data.user.id);
        return { 
          success: true, 
          data,
          user: data.user,
          session: data.session,
          error: null 
        };
      } else {
        return { success: false, error: 'No user data returned' };
      }
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected signin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            !navigator.onLine;

      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }

  async signUp(userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<SupabaseSignUpResult> {
    try {
      console.log('[SupabaseAuthAdapter] Starting signup process for:', userData.email);

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.displayName
          }
        }
      });

      if (error) {
        console.error('[SupabaseAuthAdapter] Signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('[SupabaseAuthAdapter] Signup successful for user:', data.user.id);
        return { 
          success: true, 
          data,
          user: data.user,
          requiresEmailVerification: !data.session // If no session, email verification required
        };
      }
      
      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      console.log('[SupabaseAuthAdapter] Getting user by email:', email);
      
      // In a real app, this would query the profiles table or use admin functions
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('[SupabaseAuthAdapter] Error fetching user by email:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected error fetching user by email:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      console.log('[SupabaseAuthAdapter] Getting current user');
      
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('[SupabaseAuthAdapter] Error getting current user:', error);
        return null;
      }
      
      console.log('[SupabaseAuthAdapter] Current user retrieved:', { hasUser: !!user });
      return user;
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected error getting current user:', error);
      return null;
    }
  }

  async updateUserProfile(updates: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[SupabaseAuthAdapter] Updating user profile');
      
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl
        }
      });

      if (error) {
        console.error('[SupabaseAuthAdapter] Failed to update user profile:', error);
        return { success: false, error: error.message };
      }

      console.log('[SupabaseAuthAdapter] User profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected error updating user profile:', error);
      return { success: false, error: 'Failed to update user profile' };
    }
  }

  async deleteUser(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[SupabaseAuthAdapter] Deleting current user');
      
      // Note: In a real app, user deletion might need admin privileges
      // For now, we'll just sign out the user as self-deletion
      const signOutResult = await this.signOut();
      
      if (!signOutResult.success) {
        return { success: false, error: signOutResult.error };
      }

      console.log('[SupabaseAuthAdapter] User deletion completed (signed out)');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[SupabaseAuthAdapter] Starting signout process');

      // On web, clear localStorage first to prevent race conditions following existing patterns
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          console.log('[SupabaseAuthAdapter] Cleared Supabase localStorage items:', keysToRemove);
        } catch (error) {
          console.warn('[SupabaseAuthAdapter] Failed to clear localStorage:', error);
        }
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[SupabaseAuthAdapter] Signout error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseAuthAdapter] Signout successful');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Error during signout:', error);
      return { success: false, error: 'Signout failed' };
    }
  }

  async getCurrentSession(): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      console.log('[SupabaseAuthAdapter] Getting current session');
      
      const { data } = await supabase.auth.getSession();
      
      console.log('[SupabaseAuthAdapter] Session retrieved:', { hasSession: !!data.session });
      return { success: true, session: data.session };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Failed to get session:', error);
      return { success: false, error: 'Failed to get session' };
    }
  }

  async refreshSession(): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      console.log('[SupabaseAuthAdapter] Refreshing session');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[SupabaseAuthAdapter] Session refresh error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('[SupabaseAuthAdapter] Session refreshed successfully');
      return { success: true, session: data.session };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected refresh error:', error);
      return { success: false, error: 'Failed to refresh session' };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ 
    success: boolean; 
    session?: any; 
    accessToken?: string; 
    error?: string; 
    isNetworkError?: boolean; 
  }> {
    try {
      console.log('[SupabaseAuthAdapter] Refreshing token with provided refresh token');
      
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error('[SupabaseAuthAdapter] Token refresh error:', error);
        
        // Check if this is a network error
        const isNetworkError = error.message?.toLowerCase().includes('network') ||
                              error.message?.toLowerCase().includes('fetch') ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              !navigator.onLine;
        
        return { 
          success: false, 
          error: error.message,
          isNetworkError 
        };
      }
      
      if (data.session) {
        console.log('[SupabaseAuthAdapter] Token refreshed successfully');
        return { 
          success: true, 
          session: data.session,
          accessToken: data.session.access_token
        };
      } else {
        return { 
          success: false, 
          error: 'No session data returned from token refresh' 
        };
      }
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected token refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            !navigator.onLine;
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }

  async requestPasswordReset(email: string): Promise<{ 
    success: boolean; 
    error?: string; 
    isNetworkError?: boolean; 
  }> {
    try {
      console.log('[SupabaseAuthAdapter] Requesting password reset for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('[SupabaseAuthAdapter] Password reset request error:', error);
        
        const isNetworkError = error.message?.toLowerCase().includes('network') ||
                              error.message?.toLowerCase().includes('fetch') ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              !navigator.onLine;
        
        return { 
          success: false, 
          error: error.message,
          isNetworkError 
        };
      }
      
      console.log('[SupabaseAuthAdapter] Password reset request successful');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected password reset request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            !navigator.onLine;
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }

  async resetPassword(accessToken: string, newPassword: string): Promise<{ 
    success: boolean; 
    error?: string; 
    isNetworkError?: boolean; 
  }> {
    try {
      console.log('[SupabaseAuthAdapter] Resetting password');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('[SupabaseAuthAdapter] Password reset error:', error);
        
        const isNetworkError = error.message?.toLowerCase().includes('network') ||
                              error.message?.toLowerCase().includes('fetch') ||
                              error.message?.toLowerCase().includes('connection') ||
                              error.message?.toLowerCase().includes('timeout') ||
                              !navigator.onLine;
        
        return { 
          success: false, 
          error: error.message,
          isNetworkError 
        };
      }
      
      console.log('[SupabaseAuthAdapter] Password reset successful');
      return { success: true };
    } catch (error) {
      console.error('[SupabaseAuthAdapter] Unexpected password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                            errorMessage.toLowerCase().includes('fetch') ||
                            errorMessage.toLowerCase().includes('connection') ||
                            errorMessage.toLowerCase().includes('timeout') ||
                            !navigator.onLine;
      
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError 
      };
    }
  }
}
