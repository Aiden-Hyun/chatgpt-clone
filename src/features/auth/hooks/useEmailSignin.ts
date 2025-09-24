import type { AuthResponse } from "@supabase/supabase-js";

import { appConfig } from "../../../shared/lib/config";
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
      logger.info(`User login attempt for ${email}`);

      // Extra diagnostics for Android network issues
      logger.debug("Auth endpoint diagnostics (pre-request)", {
        supabaseUrl: appConfig.supabaseUrl,
        supabaseAuthUrl: `${appConfig.supabaseUrl}/auth/v1/token?grant_type=password`,
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error(
          `Login failed for ${email}: ${error.message} (code: ${error.status})`,
          { isFetchError: (error as any)?.name === "TypeError" }
        );
        throw error;
      }

      if (!data.user) {
        logger.error(`Login failed for ${email}: No user data returned`);
        throw new Error("No user data returned");
      }

      logger.info(
        `Login successful for ${data.user.email} (user ID: ${data.user.id})`
      );

      return data;
    },
    enableNetworkErrorDetection: true,
    onSuccess: (data) => {
      logger.info(
        `User session established for ${data.user?.email} (ID: ${data.user?.id})`
      );
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
