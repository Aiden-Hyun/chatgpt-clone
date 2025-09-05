import type { AuthResponse } from "@supabase/supabase-js";

import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";

import { useAuthOperation } from "./useAuthOperation";

interface SignInParams {
  email: string;
  password: string;
}

export const useEmailSignin = () => {
  const logger = getLogger("useEmailSignin");
  const { execute, isLoading } = useAuthOperation<
    SignInParams,
    AuthResponse["data"]
  >({
    operationName: "emailSignIn",
    operation: async ({ email, password }) => {
      logger.info("User login attempt", { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error("Login failed", {
          email,
          error: error.message,
          errorCode: error.status,
        });
        throw error;
      }

      if (!data.user) {
        logger.error("Login failed: No user data returned", { email });
        throw new Error("No user data returned");
      }

      logger.info("Login successful", {
        userId: data.user.id,
        email: data.user.email,
        sessionExpiresAt: data.session?.expires_at,
      });

      return data;
    },
    enableNetworkErrorDetection: true,
    onSuccess: (data) => {
      logger.info("User session established", {
        userId: data.user?.id,
        email: data.user?.email,
      });
    },
  });

  const signIn = async (email: string, password: string) => {
    return execute({ email, password });
  };

  return {
    signIn,
    isLoading,
  };
};
