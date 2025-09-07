// src/entities/user/hooks/useUpdateProfile.ts
import { useCallback, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";
import {
  SupabaseProfileCRUD,
  UpdateProfileData,
} from "../CRUD/SupabaseProfileCRUD";

export const useUpdateProfile = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = useCallback(
    async (updates: UpdateProfileData) => {
      if (!session?.user?.id) {
        setError(new Error("No authenticated user"));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileCRUD = new SupabaseProfileCRUD();
        await profileCRUD.update(session.user.id, updates);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update profile")
        );
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  const upsertProfile = useCallback(
    async (profileData: any) => {
      if (!session?.user?.id) {
        setError(new Error("No authenticated user"));
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileCRUD = new SupabaseProfileCRUD();
        await profileCRUD.upsert({
          id: session.user.id,
          email: session.user.email || "",
          ...profileData,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to upsert profile")
        );
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, session?.user?.email]
  );

  return {
    updateProfile,
    upsertProfile,
    loading,
    error,
  };
};
