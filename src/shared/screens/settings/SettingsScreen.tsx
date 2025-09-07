import { Platform, SafeAreaView, ScrollView } from "react-native";

import { useReadUser } from "@/entities/user";
import { CustomAlert, useCustomAlert } from "@/features/alert";
import { useLogout } from "@/features/auth";
import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Button } from "@/shared/components/ui";

import {
  AboutSection,
  AccountSection,
  DataPrivacySection,
  PreferencesSection,
  SettingsHeader,
} from "./components";
import { useSettingsNavigation } from "./hooks/useSettingsNavigation";
import { createSettingsStyles } from "./SettingsScreen.styles";

export const SettingsScreen = () => {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { userName, email, refresh } = useReadUser();
  const { logout, isLoggingOut } = useLogout();
  const { alert, hideAlert } = useCustomAlert();
  const styles = createSettingsStyles(theme);

  const { handleBack, handleLogout, navigateToThemes } =
    useSettingsNavigation();

  const onLogout = async () => {
    await handleLogout(logout);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <SettingsHeader onBack={handleBack} title={t("settings.title")} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        bounces={Platform.OS === "ios"}
        alwaysBounceVertical={Platform.OS === "ios"}
      >
        {/* Account Section */}
        <AccountSection userName={userName} email={email} onRefresh={refresh} />

        {/* Preferences Section */}
        <PreferencesSection onNavigateToThemes={navigateToThemes} />

        {/* Data & Privacy Section */}
        <DataPrivacySection />

        {/* About Section */}
        <AboutSection />

        {/* Logout Button */}
        <Button
          label={isLoggingOut ? t("home.logging_out") : t("home.logout")}
          onPress={onLogout}
          disabled={isLoggingOut}
          isLoading={isLoggingOut}
          status="error"
          fullWidth
          containerStyle={styles.logoutButton}
        />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={() => {
          alert.onConfirm?.();
          hideAlert();
        }}
        onCancel={() => {
          alert.onCancel?.();
          hideAlert();
        }}
      />
    </SafeAreaView>
  );
};
