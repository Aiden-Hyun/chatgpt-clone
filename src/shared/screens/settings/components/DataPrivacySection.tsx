import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { router } from "expo-router";
import { Alert, Linking, View } from "react-native";

import { useToast } from "@/features/alert";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Card, ListItem, Text } from "@/shared/components/ui";
import { getLogger } from "@/shared/services/logger";

import { createSettingsStyles } from "../SettingsScreen.styles";

interface DataPrivacySectionProps {
  userEmail?: string | null;
}

export const DataPrivacySection: React.FC<DataPrivacySectionProps> = ({
  userEmail,
}) => {
  const logger = getLogger("DataPrivacySection");
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { showError, showInfo } = useToast();
  const styles = createSettingsStyles(theme);

  const handleExportData = () => {
    // TODO: Implement data export functionality
  };

  const handleClearConversations = () => {
    // TODO: Implement clear conversations functionality
  };

  const handlePrivacyPolicy = () => {
    router.push("/settings/privacy");
  };

  const requestAccountDeletion = useCallback(async () => {
    const subject = encodeURIComponent(
      t("settings.delete_account_email_subject")
    );
    const bodyLines = [
      t("settings.delete_account_email_body"),
      userEmail ? `\nAccount email: ${userEmail}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const mailtoUrl = `mailto:support@malloai.app?subject=${subject}&body=${encodeURIComponent(
      bodyLines
    )}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (!supported) {
        throw new Error("Email client unavailable");
      }
      showInfo(t("settings.delete_account_launch_email"));
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      logger.error("Failed to launch email client for deletion", { error });
      showError(t("settings.delete_account_email_error"));
      Alert.alert(
        t("settings.delete_account"),
        t("settings.delete_account_email_error")
      );
    }
  }, [logger, showError, showInfo, t, userEmail]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t("settings.delete_account_confirm_title"),
      t("settings.delete_account_confirm_message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.delete_account_confirm_action"),
          style: "destructive",
          onPress: requestAccountDeletion,
        },
      ]
    );
  }, [requestAccountDeletion, t]);

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
          description={t("settings.delete_account_description")}
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
