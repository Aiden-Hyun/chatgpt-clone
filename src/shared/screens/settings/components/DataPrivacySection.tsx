import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";

import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Card, ListItem, Text } from "@/shared/components/ui";
import { supabase } from "@/shared/lib/supabase";
import { getLogger } from "@/shared/services/logger";

import { createSettingsStyles } from "../SettingsScreen.styles";

export const DataPrivacySection: React.FC = () => {
  const logger = getLogger("DataPrivacySection");
  const { t, currentLanguage } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);
  const [pendingDeletionDate, setPendingDeletionDate] = useState<
    string | null
  >(null);

  const handleExportData = () => {
    // TODO: Implement data export functionality
  };

  const handleClearConversations = () => {
    // TODO: Implement clear conversations functionality
  };

  const handlePrivacyPolicy = () => {
    router.push("/settings/privacy");
  };

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

  const refreshDeletionStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "account-deletion",
        {
          body: { action: "status" },
        }
      );

      if (error) {
        throw error;
      }

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

  const handleDeleteAccount = useCallback(() => {
    router.push("/settings/delete-account");
  }, []);

  const deleteDescription = pendingDeletionDate
    ? t("settings.delete_account_pending").replace(
        "{date}",
        formatDateForUser(pendingDeletionDate)
      )
    : t("settings.delete_account_description");

  return (
    <View style={styles.section}>
      <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
        {t("settings.data_privacy")}
      </Text>
      <Card variant="default" padding="md" containerStyle={styles.card}>
        <ListItem
          variant="settings"
          title={t("settings.export_data")}
          leftElement={
            <Ionicons
              name="cloud-download-outline"
              size={24}
              color={theme.colors.status.success.primary}
            />
          }
          rightElement={
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.text.tertiary}
            />
          }
          onPress={handleExportData}
        />
        <ListItem
          variant="settings"
          title={t("settings.clear_conversations")}
          leftElement={
            <Ionicons
              name="trash-outline"
              size={24}
              color={theme.colors.status.error.primary}
            />
          }
          rightElement={
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.text.tertiary}
            />
          }
          onPress={handleClearConversations}
        />
        <ListItem
          variant="settings"
          title={t("settings.privacy_policy")}
          leftElement={
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={theme.colors.status.info.primary}
            />
          }
          rightElement={
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.text.tertiary}
            />
          }
          onPress={handlePrivacyPolicy}
        />
        <ListItem
          variant="settings"
          title={t("settings.delete_account")}
          description={deleteDescription}
          leftElement={
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={theme.colors.status.error.primary}
            />
          }
          rightElement={
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.text.tertiary}
            />
          }
          onPress={handleDeleteAccount}
        />
      </Card>
    </View>
  );
};
