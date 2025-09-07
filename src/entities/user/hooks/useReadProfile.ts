// src/entities/user/hooks/useReadProfile.ts
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";
import { SupabaseProfileCRUD, UserProfile } from "../CRUD/SupabaseProfileCRUD";

export const useReadProfile = (userId?: string) => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const targetUserId = userId || session?.user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      const profileCRUD = new SupabaseProfileCRUD();
      const profileData = await profileCRUD.getById(targetUserId);
      setProfile(profileData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch profile")
      );
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
  };
};
