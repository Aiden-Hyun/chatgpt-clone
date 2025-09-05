import type { AuthResponse } from "@supabase/supabase-js";

import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";

import { useAuthOperation } from "./useAuthOperation";

interface SignUpParams {
  email: string;
  password: string;
}

export const useEmailSignup = () => {
  const logger = getLogger("useEmailSignup");
  const { execute, isLoading } = useAuthOperation<
    SignUpParams,
    AuthResponse["data"]
  >({
    operationName: "emailSignUp",
    operation: async ({ email, password }) => {
      logger.info("User signup attempt", { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        logger.error("Signup failed", {
          email,
          error: error.message,
          errorCode: error.status,
        });
        throw error;
      }

      if (!data.user) {
        logger.error("Signup failed: No user data returned", { email });
        throw new Error("No user data returned");
      }

      logger.info("Signup successful", {
        userId: data.user.id,
        email: data.user.email,
        needsEmailConfirmation: !data.session,
      });

      return data;
    },
    onError: (error) => {
      logger.error("Signup operation failed", { error: error.message });
    },
  });

  const signUp = async (email: string, password: string) => {
    return execute({ email, password });
  };

  return {
    signUp,
    isLoading,
  };
};
