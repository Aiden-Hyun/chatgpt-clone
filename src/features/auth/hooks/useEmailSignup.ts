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
      logger.debug("Starting signup process", { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        logger.error("Signup error", { error });
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned");
      }

      return data;
    },
    onError: (error) => {
      logger.error("Unexpected signup error", { error });
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
