import { router } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

import { supabase } from "../../../shared/lib/supabase";
import { getLogger } from "../../../shared/services/logger";

import { useAuthOperationVoid } from "./useAuthOperation";

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const logger = getLogger("useLogout");
  const { execute, isLoading } = useAuthOperationVoid<void>({
    operationName: "logout",
    operation: async () => {
      logger.info("User logout initiated");

      // On web, clear localStorage first to prevent race conditions
      if (Platform.OS === "web") {
        try {
          // Clear all Supabase-related localStorage items
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          logger.debug("Cleared Supabase localStorage items", { keysToRemove });
        } catch (error) {
          logger.warn("Failed to clear localStorage", { error });
        }
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      logger.info("User logout completed");
    },
    onSuccess: () => {
      logger.info("Logout successful, navigating to auth screen");
      // Navigate to login screen on success
      router.replace("/auth");
    },
    onError: (error) => {
      logger.error("Logout failed", { error: error.message });
      // Even if there's an error, try to navigate to login
      router.replace("/auth");
    },
  });

  const logout = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    logout,
    isLoggingOut: isLoading,
  };
};
