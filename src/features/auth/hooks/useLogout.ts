import { router } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

import { supabase } from "../../../shared/lib/supabase";

import { useAuthOperationVoid } from "./useAuthOperation";

/**
 * Hook for handling user logout functionality
 * Centralizes logout logic and provides loading state
 */
export const useLogout = () => {
  const { execute, isLoading } = useAuthOperationVoid<void>({
    operationName: "logout",
    operation: async () => {
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

          if (__DEV__) {
            console.log(
              "🧹 [LOGOUT] Cleared Supabase localStorage items:",
              keysToRemove
            );
          }
        } catch (error) {
          console.warn("Failed to clear localStorage:", error);
        }
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      // Navigate to login screen on success
      router.replace("/auth");
    },
    onError: (error) => {
      console.error("Error during logout:", error);
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
