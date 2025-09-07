import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { useUpdateProfile } from "@/entities/user";
import { useCustomAlert } from "@/features/alert";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Button, Card, Input, ListItem, Text } from "@/shared/components/ui";

import { createSettingsStyles } from "../SettingsScreen.styles";

interface AccountSectionProps {
  userName: string | null;
  email: string | null;
  onRefresh: () => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  userName,
  email,
  onRefresh,
}) => {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { updateProfile, loading } = useUpdateProfile();
  const { showSuccessAlert, showErrorAlert } = useCustomAlert();
  const styles = createSettingsStyles(theme);

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userName || "");

  // Update editedName when userName changes
  React.useEffect(() => {
    setEditedName(userName || "");
  }, [userName]);

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditedName(userName || "");
  };

  const handleNameSave = async () => {
    if (editedName.trim() === "") {
      showErrorAlert(t("common.error"), t("settings.name_empty"));
      return;
    }

    try {
      await updateProfile({ display_name: editedName.trim() });

      // Small delay to ensure database update is complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh user info to get the updated name
      await onRefresh();

      setIsEditingName(false);
      showSuccessAlert(t("common.success"), t("settings.name_updated"));
    } catch {
      showErrorAlert(t("common.error"), t("settings.name_update_failed"));
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName(userName || "");
  };

  return (
    <View style={styles.section}>
      <Text variant="h3" weight="semibold" style={styles.sectionTitle}>
        {t("settings.account")}
      </Text>
      <Card variant="default" padding="md" containerStyle={styles.card}>
        {isEditingName ? (
          <View style={styles.editContainer}>
            <Input
              value={editedName}
              onChangeText={setEditedName}
              placeholder={t("settings.name")}
              variant="filled"
              autoFocus
              onBlur={() => {
                // Don't cancel on blur - let user press save button
              }}
            />
            <View style={styles.editButtons}>
              <Button
                label={loading ? t("common.loading") : t("common.save")}
                onPress={handleNameSave}
                disabled={loading}
                isLoading={loading}
                size="sm"
                containerStyle={styles.saveButton}
              />
              <Button
                variant="outline"
                label={t("common.cancel")}
                onPress={handleNameCancel}
                size="sm"
                containerStyle={styles.cancelButton}
              />
            </View>
          </View>
        ) : (
          <ListItem
            variant="settings"
            title={t("settings.name")}
            subtitle={userName || t("settings.not_set")}
            leftElement={
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={theme.colors.status.info.primary}
              />
            }
            rightElement={
              <Button
                variant="ghost"
                label={t("common.edit")}
                onPress={handleNameEdit}
                size="sm"
              />
            }
          />
        )}

        <ListItem
          variant="settings"
          title={t("settings.email")}
          subtitle={email || t("settings.not_set")}
          leftElement={
            <Ionicons
              name="mail-open-outline"
              size={24}
              color={theme.colors.status.success.primary}
            />
          }
        />
      </Card>
    </View>
  );
};
