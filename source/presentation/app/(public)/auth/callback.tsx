import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../../../../business/auth/hooks";

const CallbackScreen = () => {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    // This screen is just a handler.
    // The useAuth hook will automatically handle the session from the URL.
    // Once the session is confirmed (or loading is done), we redirect.
    if (!isLoading) {
      if (session) {
        // If login was successful, go to the main chat screen.
        router.replace("/chat");
      } else {
        // If it failed for some reason, go back to the login screen.
        router.replace("/auth");
      }
    }
  }, [session, isLoading, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default CallbackScreen;
