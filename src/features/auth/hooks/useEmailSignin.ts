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
      logger.debug("Starting signin process", { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      logger.debug("Signin response", {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: !!error,
        userId: data?.user?.id,
        sessionExpiresAt: data?.session?.expires_at,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned");
      }

      return data;
    },
    enableNetworkErrorDetection: true,
    onSuccess: (data) => {
      if (__DEV__) {
        logger.info("Signin successful", { userId: data.user?.id });
      }
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
