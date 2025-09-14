import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, SafeAreaView, ScrollView, View } from "react-native";

import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Text } from "@/shared/components/ui";

import { SettingsHeader } from "../components";
import { createSettingsStyles } from "../SettingsScreen.styles";
import {
  getPrivacyContentByLanguage,
  resolvePrivacyLanguageCode,
} from "./privacyContent";

export const PrivacyScreen = () => {
  const { t, currentLanguage } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  const handleBack = () => {
    router.replace("/settings");
  };

  const content = useMemo(() => {
    const lang = resolvePrivacyLanguageCode(currentLanguage);
    return getPrivacyContentByLanguage(lang);
  }, [currentLanguage]);

  const paragraphStyle = useMemo(() => {
    const baseFontSize = theme.typography.fontSizes.md;
    const computedLineHeight = Math.round(baseFontSize * 1.6);
    return [
      styles.termsText,
      { color: theme.colors.text.primary, lineHeight: computedLineHeight },
    ];
  }, [styles.termsText, theme]);

  return (
    <SafeAreaView style={styles.container}>
      <SettingsHeader onBack={handleBack} title={t("settings.privacy_policy")} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        bounces={Platform.OS === "ios"}
        alwaysBounceVertical={Platform.OS === "ios"}
      >
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            {content.title}
          </Text>
          {content.paragraphs.map((p, idx) => (
            <Text key={idx} variant="body" style={paragraphStyle}>
              {p}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


