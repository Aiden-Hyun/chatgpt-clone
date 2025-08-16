import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme & Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Theme</Text>
          <View style={styles.currentThemeCard}>
            <View style={styles.currentThemePreview}>
              <View style={styles.previewContent}>
                <View style={styles.previewButton} />
                <View style={styles.previewText} />
              </View>
            </View>
            <View style={styles.currentThemeInfo}>
              <Text style={styles.currentThemeName}>{currentTheme?.name || 'Default'}</Text>
              <Text style={styles.currentThemeDescription}>
                {currentTheme?.description || 'Clean and modern design'}
              </Text>
              <View style={styles.currentModeBadge}>
                <Text style={styles.currentModeText}>
                  {themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
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
                >
                  <View style={styles.themePreview}>
                    <View style={styles.previewElements}>
                      <View style={[styles.previewButton, { backgroundColor: themeOption.theme.light.colors.primary }]} />
                      <View style={[styles.previewCard, { backgroundColor: themeOption.theme.light.colors.background.secondary }]} />
                    </View>
                  </View>
                  <Text style={styles.themeName}>{themeOption.name}</Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Appearance Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.modeSelector}>
            {[
              { value: 'light' as ThemeMode, label: 'Light', icon: 'light-mode' },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: 'dark-mode' },
              { value: 'system' as ThemeMode, label: 'System', icon: 'settings' }
            ].map((mode) => {
              const isSelected = mode.value === themeMode;
              return (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeButton,
                    isSelected && styles.modeButtonSelected
                  ]}
                  onPress={() => handleModeSelect(mode.value)}
                >
                  <MaterialIcons 
                    name={mode.icon as any} 
                    size={20} 
                    color={isSelected ? theme.colors.text.inverted : theme.colors.text.primary} 
                  />
                  <Text style={[
                    styles.modeText,
                    isSelected && styles.modeTextSelected
                  ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
