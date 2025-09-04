import { useCallback } from "react";

import { useAuth } from "@/entities/session";

import { useAuthOperationVoid } from "./useAuthOperation";
import { supabase } from "../../../shared/lib/supabase";

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
  const { execute, isLoading } = useAuthOperationVoid<UpdateProfileData>({
    operation: async (data: UpdateProfileData) => {
      if (!session?.user) {
        throw new Error("No active session");
      }

      // First, check if profile exists
      const { error: checkError } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw checkError;
      }

      // Update the profiles table (use upsert to handle case where profile doesn't exist)
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
        throw profileError;
      }

      // Update auth metadata (for backward compatibility)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.display_name,
          name: data.display_name,
        },
      });

      if (authError) {
        throw authError;
      }
    }
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
