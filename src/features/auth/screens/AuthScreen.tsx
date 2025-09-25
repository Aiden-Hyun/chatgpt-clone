import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router, usePathname } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { useAuth } from "@/entities/session";
import { useToast } from "@/features/alert";
import { useEmailSignin } from "@/features/auth";
import { LanguageSelector, useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import {
  Button,
  Card,
  FormWrapper,
  Input,
  LoadingScreen,
  Text,
} from "@/shared/components";
import { useLoadingState } from "@/shared/hooks";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import { createAuthStyles } from "./AuthScreen.styles";

// Configure Google Sign-In
GoogleSignin.configure({
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
  webClientId:
    "817884024065-m9cpgjg71js0hi98jkq05toaht10r4hg.apps.googleusercontent.com", // Web client ID (works for both iOS and Android)
});

export const AuthScreen = () => {
  const { session } = useAuth();
  const logger = getLogger("AuthScreen");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { signIn, isLoading: isSigningIn } = useEmailSignin();
  const { loading, stopLoading } = useLoadingState({ initialLoading: true });
  const {
    loading: signingInWithGoogle,
    startLoading: startSigningInWithGoogle,
    stopLoading: stopSigningInWithGoogle,
  } = useLoadingState();

  const { showSuccess, showError } = useToast();

  const pathname = usePathname();
  const theme = useAppTheme();
  const styles = createAuthStyles(theme);
  const navigationAttempted = useRef(false);
  const { t } = useLanguageContext();

  // Note: We're no longer using refs with our new Input component

  // Session check logic
  const checkSession = useCallback(async () => {
    logger.debug("Checking session status", {
      hasSession: !!session,
      userId: session?.user?.id,
    });

    try {
      if (session) {
        logger.info("User already authenticated, redirecting to home", {
          userId: session.user.id,
          email: session.user.email,
        });
        showSuccess(t("auth.login_successful") || "Login successful!");
        router.replace("/");
      } else {
        logger.debug("No active session, showing auth form");
        stopLoading();
      }
    } catch (error) {
      logger.error("Session check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      showError(t("auth.network_error"));
      stopLoading();
    }
  }, [session, showSuccess, showError, t, stopLoading, logger]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Monitor pathname changes to detect navigation
  useEffect(() => {
    if (navigationAttempted.current) {
      navigationAttempted.current = false;
    }
  }, [pathname]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    logger.debug("Validating form", {
      hasEmail: !!email.trim(),
      hasPassword: !!password.trim(),
      emailLength: email.length,
      passwordLength: password.length,
    });

    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    const isValid = Object.keys(newErrors).length === 0;
    // Only log validation failures, not every validation attempt
    if (!isValid) {
      logger.debug("Form validation failed", {
        errorCount: Object.keys(newErrors).length,
        errors: Object.keys(newErrors),
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleGoogleLogin = async () => {
    logger.info("Starting native Google Sign-In");

    try {
      startSigningInWithGoogle();

      // Check if Google Play Services are available
      logger.info("Checking Google Play Services availability");
      await GoogleSignin.hasPlayServices();
      logger.info("Google Play Services are available");

      // Sign in with Google
      logger.info("Initiating Google Sign-In");
      const userInfo = await GoogleSignin.signIn();
      logger.info("Google Sign-In successful", {
        hasIdToken: !!userInfo.data?.idToken,
        hasUser: !!userInfo.data?.user,
        userId: userInfo.data?.user?.id,
        userEmail: userInfo.data?.user?.email,
        idTokenLength: userInfo.data?.idToken?.length,
      });

      if (!userInfo.data?.idToken) {
        logger.error("No ID token received from Google", {
          userInfo: userInfo.data,
        });
        throw new Error("No ID token received from Google");
      }

      // Sign in with Supabase using the ID token
      logger.info("Authenticating with Supabase using ID token");
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.data.idToken,
      });

      if (error) {
        logger.error("Supabase authentication failed", {
          error: error.message,
          status: error.status,
          name: error.name,
        });
        throw error;
      }

      logger.info("Supabase authentication successful", {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session,
      });

      showSuccess(t("auth.login_successful") || "Login successful!");
      router.replace("/");
    } catch (error: any) {
      logger.error("Google Sign-In failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        code: error?.code,
        name: error?.name,
        status: error?.status,
        stack: error?.stack,
      });

      if (error?.code === "SIGN_IN_CANCELLED") {
        logger.info("User cancelled Google Sign-In");
      } else {
        const errorMessage = error?.message || "Google Sign-In failed";
        showError(
          `${
            t("auth.google_login_failed") || "Google Sign-In failed"
          }: ${errorMessage}`
        );
      }

      stopSigningInWithGoogle();
    }
  };

  const handleEmailSignin = async () => {
    logger.info("Starting email sign-in", {
      email: email,
      hasPassword: !!password,
    });

    Keyboard.dismiss();

    if (!validateForm()) {
      logger.warn("Form validation failed, aborting sign-in");
      return;
    }

    try {
      const result = await signIn(email, password);

      if (result.success) {
        logger.info("Email sign-in successful", {
          email: email,
          userId: result.data?.user?.id,
        });
        showSuccess(t("auth.login_successful") || "Login successful!");
        router.replace("/");
      } else {
        logger.warn("Email sign-in failed", {
          email: email,
          error: result.error,
          isNetworkError: result.isNetworkError,
          errorCode: result.errorCode,
        });
        // Show appropriate localized message based on error type
        if (result.isNetworkError) {
          showError(t("auth.network_error"));
        } else {
          showError(t("auth.check_credentials"));
        }
      }
    } catch (error) {
      // Check if this is a network error in the UI catch block
      const isNetworkError =
        !navigator.onLine ||
        (error instanceof Error &&
          (error.message.toLowerCase().includes("network") ||
            error.message.toLowerCase().includes("fetch") ||
            error.message.toLowerCase().includes("connection")));

      logger.error("Email sign-in threw unexpected error", {
        email: email,
        error: error instanceof Error ? error.message : "Unknown error",
        isNetworkError,
        isOnline: navigator.onLine,
      });

      if (isNetworkError) {
        showError(t("auth.network_error"));
      } else {
        showError(t("auth.unexpected_error"));
      }
    }
  };

  const handleEmailSubmit = () => {
    // We're no longer using refs to focus
    // Focus is handled automatically by the Input component
  };

  const handlePasswordSubmit = () => {
    handleEmailSignin();
  };

  const handleForgotPassword = () => {
    try {
      router.push("/forgot-password");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleGoToSignup = () => {
    try {
      router.push("/signup");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  if (loading) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Card
            variant="flat"
            padding="lg"
            containerStyle={{ width: "100%", maxWidth: 400 }}
          >
            <Text variant="h1" center>
              {t("auth.welcome")}
            </Text>

            {/* Google Login Button */}
            <Button
              variant="primary"
              size="lg"
              label={
                signingInWithGoogle
                  ? t("auth.redirecting")
                  : `🔍 ${t("auth.login_with_google")}`
              }
              onPress={handleGoogleLogin}
              disabled={signingInWithGoogle}
              isLoading={signingInWithGoogle}
              fullWidth
              containerStyle={{ marginTop: theme.spacing.lg }}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <Text variant="caption" color={theme.colors.text.tertiary}>
                {t("auth.or")}
              </Text>
            </View>

            {/* Email/Password Form */}
            <FormWrapper onSubmit={handleEmailSignin} style={{ width: "100%" }}>
              <Input
                label={t("auth.email")}
                placeholder={t("auth.email")}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSigningIn}
                variant="filled"
                returnKeyType="next"
                onSubmitEditing={handleEmailSubmit}
                blurOnSubmit={false}
                errorText={errors.email}
                status={errors.email ? "error" : "default"}
              />

              <Input
                label={t("auth.password")}
                placeholder={t("auth.password")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                editable={!isSigningIn}
                variant="filled"
                returnKeyType="done"
                onSubmitEditing={handlePasswordSubmit}
                errorText={errors.password}
                status={errors.password ? "error" : "default"}
              />
            </FormWrapper>

            {/* Sign In Button */}
            <Button
              variant="primary"
              size="lg"
              label={
                isSigningIn
                  ? t("auth.signing_in")
                  : t("auth.sign_in_with_email")
              }
              onPress={handleEmailSignin}
              disabled={isSigningIn}
              isLoading={isSigningIn}
              fullWidth
              containerStyle={{ marginTop: theme.spacing.md }}
            />

            {/* Links */}
            <Button
              variant="link"
              size="md"
              label={t("auth.forgot_password")}
              onPress={handleForgotPassword}
              disabled={isSigningIn}
              containerStyle={{ marginTop: theme.spacing.sm }}
            />

            <Button
              variant="link"
              size="md"
              label={t("auth.no_account_link")}
              onPress={handleGoToSignup}
              disabled={isSigningIn}
              containerStyle={{ marginTop: theme.spacing.sm }}
            />

            {/* Language Selector */}
            <View style={{ marginTop: theme.spacing.xl, alignItems: "center" }}>
              <LanguageSelector />
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
