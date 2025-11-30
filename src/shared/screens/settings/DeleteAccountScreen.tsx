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

import { useToast } from "@/features/alert";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Button, Card, Text } from "@/shared/components/ui";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import { SettingsHeader } from "./components";
import { createDeleteAccountStyles } from "./DeleteAccountScreen.styles";

export const DeleteAccountScreen = () => {
  const logger = getLogger("DeleteAccountScreen");
  const { t, currentLanguage } = useLanguageContext();
  const theme = useAppTheme();
  const { showError, showSuccess } = useToast();
  const styles = createDeleteAccountStyles(theme);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDeletionDate, setPendingDeletionDate] = useState<string | null>(
    null
  );
  const [isCancelling, setIsCancelling] = useState(false);
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

    try {
      // Schedule deletion - user is already authenticated via their session
      const { data, error } = await supabase.functions.invoke(
        "account-deletion",
        { body: { action: "request" } }
      );

      if (error) {
        // Log the actual error details
        logger.error("Edge function error", { 
          error,
          message: error?.message,
          context: error?.context 
        });
        throw error;
      }

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

      // Log out the user after scheduling deletion
      await supabase.auth.signOut();
      // Navigation will be handled by auth state change listener
    } catch (error) {
      logger.error("Failed to schedule account deletion", { error });
      showError(t("settings.delete_account_request_error"));
    } finally {
      setIsLoading(false);
    }
  }, [
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

  const canSubmit = isConfirmed;

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

