// src/entities/user/hooks/useReadUser.ts
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../session/hooks/useSession";

export interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useReadUser = (): UserInfo => {
  const { session, isLoading } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getUserInfo = useCallback(async () => {
    if (!session?.user) {
      setUserName("");
      setEmail(null);
      setUserId(null);
      setError(null);
      return;
    }

    try {
      // Extract user ID
      setUserId(session.user.id);

      // Extract email
      setEmail(session.user.email || null);

      // Use session metadata for display name
      const name =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "User";
      setUserName(name);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to get user info"));
      // On error, set default values
      setUserName("User");
      setEmail(null);
      setUserId(null);
    }
  }, [session]);

  const refresh = useCallback(async () => {
    await getUserInfo();
  }, [getUserInfo]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  return {
    userName,
    email,
    userId,
    loading: isLoading,
    error,
    refresh,
  };
};
