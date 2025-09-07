// src/entities/user/CRUD/SupabaseProfileCRUD.ts
import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
  theme_mode?: string;
  theme_style?: string;
  language?: string;
}

export interface CreateProfileData {
  id: string;
  email: string;
  display_name?: string;
  theme_mode?: string;
  theme_style?: string;
  language?: string;
}

export interface UpdateProfileData {
  display_name?: string;
  theme_mode?: string;
  theme_style?: string;
  language?: string;
}

export class SupabaseProfileCRUD {
  private logger = getLogger("SupabaseProfileCRUD");
  private tableName = "profiles";

  /**
   * Fetches a user profile by their ID.
   * @param userId The ID of the user.
   * @returns A promise that resolves to the user profile or null if not found.
   */
  async getById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned - profile doesn't exist
          this.logger.debug("Profile not found", { userId });
          return null;
        }
        this.logger.error("Error fetching user profile", { userId, error });
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      this.logger.error("Unexpected error fetching user profile", {
        userId,
        error,
      });
      return null;
    }
  }

  /**
   * Creates or updates a user profile.
   * @param profileData The data for the user profile.
   * @returns A promise that resolves to the created/updated user profile or null on error.
   */
  async upsert(profileData: CreateProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.logger.error("Error upserting user profile", {
          profileData,
          error,
        });
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      this.logger.error("Unexpected error upserting user profile", {
        profileData,
        error,
      });
      return null;
    }
  }

  /**
   * Updates specific fields of a user profile.
   * @param userId The ID of the user to update.
   * @param updates The fields to update.
   * @returns A promise that resolves to the updated user profile or null on error.
   */
  async update(
    userId: string,
    updates: UpdateProfileData
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        this.logger.error("Error updating user profile", {
          userId,
          updates,
          error,
        });
        return null;
      }
      return data as UserProfile;
    } catch (error) {
      this.logger.error("Unexpected error updating user profile", {
        userId,
        updates,
        error,
      });
      return null;
    }
  }

  /**
   * Deletes a user profile by their ID.
   * @param userId The ID of the user to delete.
   * @returns A promise that resolves to true if successful, false otherwise.
   */
  async delete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", userId);

      if (error) {
        this.logger.error("Error deleting user profile", { userId, error });
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error("Unexpected error deleting user profile", {
        userId,
        error,
      });
      return false;
    }
  }

  /**
   * Gets user preferences (theme_mode, theme_style, language).
   * @param userId The ID of the user.
   * @returns A promise that resolves to user preferences or null if not found.
   */
  async getPreferences(userId: string): Promise<{
    theme_mode?: string;
    theme_style?: string;
    language?: string;
  } | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("theme_mode, theme_style, language")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          this.logger.debug("User preferences not found", { userId });
          return null;
        }
        this.logger.error("Error fetching user preferences", { userId, error });
        return null;
      }
      return data;
    } catch (error) {
      this.logger.error("Unexpected error fetching user preferences", {
        userId,
        error,
      });
      return null;
    }
  }

  /**
   * Updates user preferences (theme_mode, theme_style, language).
   * @param userId The ID of the user.
   * @param preferences The preferences to update.
   * @returns A promise that resolves to true if successful, false otherwise.
   */
  async updatePreferences(
    userId: string,
    preferences: {
      theme_mode?: string;
      theme_style?: string;
      language?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        this.logger.error("Error updating user preferences", {
          userId,
          preferences,
          error,
        });
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error("Unexpected error updating user preferences", {
        userId,
        preferences,
        error,
      });
      return false;
    }
  }
}
