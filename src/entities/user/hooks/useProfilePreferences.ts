// src/entities/user/hooks/useProfilePreferences.ts
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";
import { SupabaseProfileCRUD } from "../CRUD/SupabaseProfileCRUD";

export interface ProfilePreferences {
  theme_mode?: string;
  theme_style?: string;
  language?: string;
}

export const useProfilePreferences = () => {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState<ProfilePreferences>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const profileCRUD = new SupabaseProfileCRUD();
      const prefs = await profileCRUD.getPreferences(session.user.id);
      setPreferences(prefs);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch preferences")
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (newPreferences: ProfilePreferences) => {
      if (!session?.user?.id) {
        setError(new Error("No authenticated user"));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileCRUD = new SupabaseProfileCRUD();
        await profileCRUD.updatePreferences(session.user.id, newPreferences);
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update preferences")
        );
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  const refetch = useCallback(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    updatePreferences,
    loading,
    error,
    refetch,
  };
};
