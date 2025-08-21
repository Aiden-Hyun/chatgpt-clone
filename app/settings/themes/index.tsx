import { Button, Card, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import { useAppTheme, useThemeMode, useThemeStyle } from '../../../src/features/theme';
import { ThemeMode } from '../../../src/features/theme/theme.types';
import { createThemeSettingsStyles } from './themes.styles';

export default function ThemeSettingsScreen() {
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { themeStyle, setThemeStyle, availableThemes } = useThemeStyle();
  const styles = createThemeSettingsStyles(theme);

  const handleBack = () => {
    router.back();
  };

  const handleThemeSelect = (themeId: string) => {
    setThemeStyle(themeId);
  };

  const handleModeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const getCurrentTheme = () => {
    return availableThemes.find(t => t.id === themeStyle);
  };

  const currentTheme = getCurrentTheme();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button 
          variant="ghost"
          onPress={handleBack}
          containerStyle={styles.backButton}
          leftIcon={<Ionicons name="arrow-back-outline" size={24} color={theme.colors.text.primary} />}
        />
        <Text variant="h2" weight="semibold" style={styles.headerTitle}>Theme & Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Theme Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>Current Theme</Text>
          <Card variant="default" padding="lg" containerStyle={styles.currentThemeCard}>
            <View style={styles.currentThemePreview}>
              <View style={styles.previewContent}>
                <View style={styles.previewButton} />
                <View style={styles.previewText} />
              </View>
            </View>
            <View style={styles.currentThemeInfo}>
              <Text variant="title" weight="semibold" style={styles.currentThemeName}>{currentTheme?.name || 'Default'}</Text>
              <Text variant="body" style={styles.currentThemeDescription}>
                {currentTheme?.description || 'Clean and modern design'}
              </Text>
              <View style={styles.currentModeBadge}>
                <Text variant="caption" weight="medium" style={styles.currentModeText}>
                  {themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Theme Selection Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>Choose Theme</Text>
          <View style={styles.themeGrid}>
            {availableThemes.map((themeOption) => {
              const isSelected = themeOption.id === themeStyle;
              return (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    isSelected && styles.themeCardSelected
                  ]}
                  onPress={() => handleThemeSelect(themeOption.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.themePreview}>
                    <View style={styles.previewElements}>
                      <View style={[styles.previewButton, { backgroundColor: themeOption.theme.light.colors.primary }]} />
                      <View style={[styles.previewCard, { backgroundColor: themeOption.theme.light.colors.background.secondary }]} />
                    </View>
                  </View>
                  <Text variant="body" weight="medium" style={styles.themeName}>{themeOption.name}</Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Appearance Mode Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.modeSelector}>
            {[
              { value: 'light' as ThemeMode, label: 'Light', icon: 'light-mode' },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: 'dark-mode' },
              { value: 'system' as ThemeMode, label: 'System', icon: 'settings' }
            ].map((mode) => {
              const isSelected = mode.value === themeMode;
              return (
                <Button
                  key={mode.value}
                  variant={isSelected ? 'primary' : 'outline'}
                  onPress={() => handleModeSelect(mode.value)}
                  containerStyle={[
                    styles.modeButton,
                    isSelected && styles.modeButtonSelected
                  ]}
                  leftIcon={
                    <Ionicons 
                      name={`${mode.icon}-outline` as any} 
                      size={20} 
                      color={isSelected ? theme.colors.text.inverted : theme.colors.text.primary} 
                    />
                  }
                  label={mode.label}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
