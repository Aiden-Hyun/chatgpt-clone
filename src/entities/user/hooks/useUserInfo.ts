import { useEffect, useState } from "react";

import { useAuth } from "../../../entities/session";
import { useLoadingState } from "../../../shared/hooks/useLoadingState";
import { supabase } from "../../../shared/lib/supabase";
import type { UserInfo } from "../model/types";

/**
 * Hook for fetching and managing user information from the current session
 * Extracts user session data and resolves display name from metadata
 */
export const useUserInfo = (): UserInfo => {
  const { session } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { loading, error, executeWithLoading } = useLoadingState({
    initialLoading: true,
  });

  const getUserInfo = async () => {
    await executeWithLoading(
      async () => {
        if (session?.user) {
          // Extract user ID
          setUserId(session.user.id);

          // Extract email
          setEmail(session.user.email || null);

          // Try to get display name from profiles table first
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            // Profile might not exist yet, that's okay
            console.warn("Profile fetch error (non-critical):", profileError);
          }

          // Use profile display_name if available, otherwise fall back to metadata
          const name =
            profileData?.display_name ||
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User";
          setUserName(name);
        } else {
          // No session, reset user info
          setUserName("");
          setEmail(null);
          setUserId(null);
        }
      },
      {
        onError: (error) => {
          console.error("Error fetching user info:", error);
          // On error, set default values
          setUserName("User");
          setEmail(null);
          setUserId(null);
        },
      }
    );
  };

  const refresh = async () => {
    await getUserInfo();
  };

  useEffect(() => {
    getUserInfo();
  }, [session]);

  return {
    userName,
    email,
    userId,
    loading,
    error,
    refresh,
  };
};
