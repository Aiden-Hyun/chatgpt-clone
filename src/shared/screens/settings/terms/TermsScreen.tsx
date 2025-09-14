import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, SafeAreaView, ScrollView, View } from "react-native";

import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import { Text } from "@/shared/components/ui";

import { SettingsHeader } from "../components";
import { createSettingsStyles } from "../SettingsScreen.styles";
import { getTermsContentByLanguage, resolveLanguageCode } from "./termsContent";

export const TermsScreen = () => {
  const { t, currentLanguage } = useLanguageContext();
  const theme = useAppTheme();
  const styles = createSettingsStyles(theme);

  const handleBack = () => {
    // Ensure we return to Settings explicitly, avoiding unexpected stack behavior
    router.replace("/settings");
  };

  const terms = useMemo(() => {
    const lang = resolveLanguageCode(currentLanguage);
    return getTermsContentByLanguage(lang);
  }, [currentLanguage]);

  // For long paragraphs, ensure comfortable readable line height (pixels)
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
      <SettingsHeader
        onBack={handleBack}
        title={t("settings.terms_of_service")}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS !== "web"}
        bounces={Platform.OS === "ios"}
        alwaysBounceVertical={Platform.OS === "ios"}
      >
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            {terms.title}
          </Text>
          {terms.paragraphs.map((p, idx) => (
            <Text key={idx} variant="body" style={paragraphStyle}>
              {p}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
