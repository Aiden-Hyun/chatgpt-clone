import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Card, ListItem, Text } from "@/shared/components/ui";
import { getLogger } from "@/shared/services/logger";

import { createSettingsStyles } from "../SettingsScreen.styles";

export const DataPrivacySection: React.FC = () => {
  const logger = getLogger("DataPrivacySection");
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  const handleExportData = () => {
    // TODO: Implement data export functionality
  };

  const handleClearConversations = () => {
    // TODO: Implement clear conversations functionality
  };

  const handlePrivacyPolicy = () => {
    // TODO: Implement privacy policy navigation
  };

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
      </Card>
    </View>
  );
};
