import { useCallback } from "react";

import { useAuth } from "@/entities/session";

import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";
import { useAuthOperationVoid } from "./useAuthOperation";

interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
}

/**
 * Hook for updating user profile information
 * Handles both Supabase auth metadata and profiles table updates
 */
export const useUpdateProfile = () => {
  const { session } = useAuth();
  const logger = getLogger("useUpdateProfile");

  const { execute, isLoading } = useAuthOperationVoid<UpdateProfileData>({
    operationName: "updateProfile",
    operation: async (data: UpdateProfileData) => {
      logger.info("Starting profile update", {
        userId: session?.user?.id,
        hasDisplayName: !!data.display_name,
        hasAvatarUrl: !!data.avatar_url,
      });

      if (!session?.user) {
        logger.error("No active session for profile update");
        throw new Error("No active session");
      }

      // First, check if profile exists
      logger.debug("Checking if profile exists", {
        userId: session.user.id,
      });

      const { error: checkError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        logger.error("Profile check failed", {
          errorCode: checkError.code,
          errorMessage: checkError.message,
        });
        throw checkError;
      }

      // Only log if profile doesn't exist (new user)
      if (checkError && checkError.code === "PGRST116") {
        logger.debug("Profile does not exist, will create new profile");
      }

      // Update the profiles table (use upsert to handle case where profile doesn't exist)
      // Remove verbose profile update log - success/failure will be logged separately

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: session.user.id,
          email: session.user.email,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        logger.error("Profile table update failed", {
          errorCode: profileError.code,
          errorMessage: profileError.message,
        });
        throw profileError;
      }

      // Remove verbose success log - final success will be logged

      // Update auth metadata (for backward compatibility)
      // Remove verbose auth metadata update log

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.display_name,
          name: data.display_name,
        },
      });

      if (authError) {
        logger.error("Auth metadata update failed", {
          errorCode: authError.code,
          errorMessage: authError.message,
        });
        throw authError;
      }

      logger.info("Profile update completed successfully", {
        userId: session.user.id,
        displayName: data.display_name,
      });
    },
  });

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      const result = await execute(data);
      // Convert to the expected format for backward compatibility
      return { success: result.success };
    },
    [execute]
  );

  return {
    updateProfile,
    isUpdating: isLoading,
  };
};
