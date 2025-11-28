import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/entities/session";
import { useToast } from "@/features/alert";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Button, Card, Input, Text } from "@/shared/components/ui";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import { SettingsHeader } from "./components";
import { createDeleteAccountStyles } from "./DeleteAccountScreen.styles";

type AuthProvider = "email" | "google" | "apple" | "other";

export const DeleteAccountScreen = () => {
  const logger = getLogger("DeleteAccountScreen");
  const { t, currentLanguage } = useLanguageContext();
  const theme = useAppTheme();
  const { session } = useAuth();
  const { showError, showSuccess } = useToast();
  const styles = createDeleteAccountStyles(theme);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeletionDate, setPendingDeletionDate] = useState<string | null>(
    null
  );
  const [isCancelling, setIsCancelling] = useState(false);

  // Detect auth provider
  const getAuthProvider = useCallback((): AuthProvider => {
    if (!session?.user) return "email";

    const identities = session.user.identities;
    if (identities && identities.length > 0) {
      const provider = identities[0].provider;
      if (provider === "google") return "google";
      if (provider === "apple") return "apple";
      if (provider === "email") return "email";
      return "other";
    }

    // Fallback: check app_metadata
    const appMetaProvider = session.user.app_metadata?.provider;
    if (appMetaProvider === "google") return "google";
    if (appMetaProvider === "apple") return "apple";
    if (appMetaProvider === "email") return "email";

    return "email";
  }, [session]);

  const authProvider = getAuthProvider();
  const isEmailUser = authProvider === "email";
  const userEmail = session?.user?.email || "";

  const formatDateForUser = useCallback(
    (isoDate?: string | null) => {
      if (!isoDate) return "";
      try {
        return new Date(isoDate).toLocaleString(currentLanguage || "en", {
          dateStyle: "medium",
          timeStyle: "short",
        });
      } catch {
        return isoDate;
      }
    },
    [currentLanguage]
  );

  // Fetch pending deletion status
  const refreshDeletionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "account-deletion",
        { body: { action: "status" } }
      );

      if (error) throw error;

      if (data?.status === "pending") {
        setPendingDeletionDate(data?.scheduled_for ?? null);
      } else {
        setPendingDeletionDate(null);
      }
    } catch (error) {
      logger.warn("Failed to refresh deletion status", { error });
    }
  }, [logger]);

  useEffect(() => {
    refreshDeletionStatus();
  }, [refreshDeletionStatus]);

  const handleBack = () => {
    router.replace("/settings");
  };

  const handleScheduleDeletion = useCallback(async () => {
    setIsLoading(true);
    setPasswordError(null);

    try {
      // Re-authenticate if email user
      if (isEmailUser) {
        if (!password.trim()) {
          setPasswordError(t("settings.delete_account_password_required"));
          setIsLoading(false);
          return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password,
        });

        if (authError) {
          logger.warn("Re-authentication failed", { error: authError.message });
          setPasswordError(t("settings.delete_account_incorrect_password"));
          setIsLoading(false);
          return;
        }
      }

      // Schedule deletion
      const { data, error } = await supabase.functions.invoke(
        "account-deletion",
        { body: { action: "request" } }
      );

      if (error) throw error;

      const scheduledFor: string | undefined = data?.scheduled_for;
      if (scheduledFor) {
        const formatted = formatDateForUser(scheduledFor);
        showSuccess(
          t("settings.delete_account_request_success").replace(
            "{date}",
            formatted
          )
        );
      } else {
        showSuccess(t("settings.delete_account_request_success_generic"));
      }

      router.replace("/settings");
    } catch (error) {
      logger.error("Failed to schedule account deletion", { error });
      showError(t("settings.delete_account_request_error"));
    } finally {
      setIsLoading(false);
    }
  }, [
    isEmailUser,
    password,
    userEmail,
    formatDateForUser,
    logger,
    showError,
    showSuccess,
    t,
  ]);

  const handleCancelDeletion = useCallback(async () => {
    setIsCancelling(true);

    try {
      const { error } = await supabase.functions.invoke("account-deletion", {
        body: { action: "cancel" },
      });

      if (error) throw error;

      showSuccess(t("settings.delete_account_cancelled"));
      setPendingDeletionDate(null);
    } catch (error) {
      logger.error("Failed to cancel account deletion", { error });
      showError(t("settings.delete_account_cancel_error"));
    } finally {
      setIsCancelling(false);
    }
  }, [logger, showError, showSuccess, t]);

  const canSubmit = isConfirmed && (isEmailUser ? password.trim() : true);

  const getProviderDisplayName = (provider: AuthProvider): string => {
    switch (provider) {
      case "google":
        return "Google";
      case "apple":
        return "Apple";
      default:
        return provider;
    }
  };

  // Pending deletion view
  if (pendingDeletionDate) {
    return (
      <SafeAreaView style={styles.container}>
        <SettingsHeader
          onBack={handleBack}
          title={t("settings.delete_account_screen_title")}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={Platform.OS !== "web"}
          bounces={Platform.OS === "ios"}
          alwaysBounceVertical={Platform.OS === "ios"}
        >
          <View style={styles.section}>
            <Card variant="default" padding="lg" containerStyle={styles.card}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={48}
                  color={theme.colors.status.warning.primary}
                />
              </View>

              <Text
                variant="h3"
                weight="semibold"
                style={styles.pendingHeadline}
              >
                {t("settings.delete_account_pending_title")}
              </Text>

              <Text variant="body" style={styles.pendingDescription}>
                {t("settings.delete_account_pending_message").replace(
                  "{date}",
                  formatDateForUser(pendingDeletionDate)
                )}
              </Text>

              <Text variant="body" style={styles.cancelHint}>
                {t("settings.delete_account_cancel_hint")}
              </Text>
            </Card>

            <Button
              label={t("settings.delete_account_cancel_button")}
              onPress={handleCancelDeletion}
              isLoading={isCancelling}
              disabled={isCancelling}
              status="default"
              fullWidth
              containerStyle={styles.cancelButton}
            />

            <Button
              label={t("common.back")}
              onPress={handleBack}
              variant="outline"
              fullWidth
              containerStyle={styles.backButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default view: schedule deletion
  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader
        onBack={handleBack}
        title={t("settings.delete_account_screen_title")}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        bounces={Platform.OS === "ios"}
        alwaysBounceVertical={Platform.OS === "ios"}
      >
        <View style={styles.section}>
          {/* Info Card */}
          <Card variant="default" padding="lg" containerStyle={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="warning-outline"
                size={48}
                color={theme.colors.status.error.primary}
              />
            </View>

            <Text variant="h3" weight="semibold" style={styles.headline}>
              {t("settings.delete_account_info_headline")}
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                  style={styles.bulletIcon}
                />
                <Text variant="body" style={styles.bulletText}>
                  {t("settings.delete_account_info_bullet_chats")}
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                  style={styles.bulletIcon}
                />
                <Text variant="body" style={styles.bulletText}>
                  {t("settings.delete_account_info_bullet_irreversible")}
                </Text>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={theme.colors.status.success.primary}
                  style={styles.bulletIcon}
                />
                <Text variant="body" style={styles.bulletTextHighlight}>
                  {t("settings.delete_account_info_bullet_cancel")}
                </Text>
              </View>
            </View>
          </Card>

          {/* Password input for email users */}
          {isEmailUser ? (
            <View style={styles.inputSection}>
              <Input
                label={t("settings.delete_account_password_label")}
                placeholder={t("auth.placeholder.password")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(null);
                }}
                secureTextEntry
                status={passwordError ? "error" : "default"}
                errorText={passwordError || undefined}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ) : (
            <Card
              variant="default"
              padding="md"
              containerStyle={styles.oauthCard}
            >
              <Text variant="body" style={styles.oauthNotice}>
                {t("settings.delete_account_oauth_notice").replace(
                  "{provider}",
                  getProviderDisplayName(authProvider)
                )}
              </Text>
            </Card>
          )}

          {/* Confirmation checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}
            >
              {isConfirmed && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={theme.colors.background.primary}
                />
              )}
            </View>
            <Text variant="body" style={styles.checkboxLabel}>
              {t("settings.delete_account_checkbox_label")}
            </Text>
          </TouchableOpacity>

          {/* Submit button */}
          <Button
            label={t("settings.delete_account_button")}
            onPress={handleScheduleDeletion}
            isLoading={isLoading}
            disabled={!canSubmit || isLoading}
            status="error"
            fullWidth
            containerStyle={styles.submitButton}
          />

          <Button
            label={t("common.cancel")}
            onPress={handleBack}
            variant="outline"
            fullWidth
            containerStyle={styles.backButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

