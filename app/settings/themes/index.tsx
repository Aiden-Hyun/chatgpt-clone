import { Button, Card, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import { useAppTheme, useThemeMode, useThemeStyle } from '../../../src/features/theme';
import { ThemeMode, ThemeWithMetadata } from '../../../src/features/theme/theme.types';
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

  // Function to extract the 5 main colors from a theme
  const getThemeColors = (themeOption: ThemeWithMetadata) => {
    const lightTheme = themeOption.theme.light.colors;
    return {
      primary: lightTheme.primary,
      secondary: lightTheme.secondary,
      background: lightTheme.background.primary,
      text: lightTheme.text.primary,
      accent: lightTheme.status.info.primary, // Using info color as accent
    };
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
              {currentTheme && (
                <>
                  {/* Color palette display for current theme */}
                  <View style={styles.currentColorPalette}>
                    {(() => {
                      const colors = getThemeColors(currentTheme);
                      return (
                        <>
                          <View style={[styles.currentColorSwatch, { backgroundColor: colors.primary }]} />
                          <View style={[styles.currentColorSwatch, { backgroundColor: colors.secondary }]} />
                          <View style={[styles.currentColorSwatch, { backgroundColor: colors.background }]} />
                          <View style={[styles.currentColorSwatch, { backgroundColor: colors.text }]} />
                          <View style={[styles.currentColorSwatch, { backgroundColor: colors.accent }]} />
                        </>
                      );
                    })()}
                  </View>
                </>
              )}
            </View>
            <View style={styles.currentThemeInfo}>
              <Text variant="title" weight="semibold" style={styles.currentThemeName}>{currentTheme?.name || 'Default'}</Text>
              <Text 
                variant="body" 
                style={styles.currentThemeDescription}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
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
              const colors = getThemeColors(themeOption);
              
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
                    {/* Color palette display */}
                    <View style={styles.colorPalette}>
                      <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: colors.secondary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: colors.background }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: colors.text }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: colors.accent }]} />
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
              { value: 'light' as ThemeMode, label: 'Light', icon: 'sunny' },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: 'moon' },
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
