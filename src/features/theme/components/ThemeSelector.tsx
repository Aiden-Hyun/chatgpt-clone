import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme, useThemeMode, useThemeStyle } from '../theme';
import { ThemeMode, ThemeWithMetadata } from '../theme.types';

interface ThemeSelectorProps {
  // Optional props can be added here
}

/**
 * Component for selecting theme style and mode
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = () => {
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { themeStyle, setThemeStyle, availableThemes } = useThemeStyle();

  // Create styles using current theme
  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    sectionContainer: {
      marginBottom: theme.spacing.xl,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    themeCard: {
      width: 100,
      height: 100,
      margin: theme.spacing.xs,
      borderRadius: theme.borders.radius.md,
      overflow: 'hidden',
      borderWidth: theme.borders.widths.medium,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
    },
    themeCardUnselected: {
      borderColor: 'transparent',
    },
    themePreview: {
      flex: 1,
      padding: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeLabel: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
      textAlign: 'center',
      padding: theme.spacing.xs,
      backgroundColor: theme.colors.background.secondary,
    },
    modeOption: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borders.radius.md,
      borderWidth: theme.borders.widths.thin,
    },
    modeOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    modeOptionUnselected: {
      backgroundColor: theme.colors.background.secondary,
      borderColor: theme.colors.border.light,
    },
    modeText: {
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium,
    },
    modeTextSelected: {
      color: theme.colors.text.inverted,
    },
    modeTextUnselected: {
      color: theme.colors.text.primary,
    },
  });

  // Function to render theme style options
  const renderThemeStyleOptions = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {availableThemes.map((themeOption: ThemeWithMetadata) => {
            const isSelected = themeOption.id === themeStyle;
            const previewStyle = {
              backgroundColor: themeOption.theme.light.colors.background.primary,
            };
            
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  isSelected ? styles.themeCardSelected : styles.themeCardUnselected,
                ]}
                onPress={() => setThemeStyle(themeOption.id)}
              >
                <View style={[styles.themePreview, previewStyle]}>
                  {/* Theme preview content could go here */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: themeOption.theme.light.colors.primary,
                    }}
                  />
                </View>
                <Text style={styles.themeLabel}>{themeOption.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Function to render theme mode options
  const renderThemeModeOptions = () => {
    const modes: { value: ThemeMode; label: string }[] = [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ];

    return (
      <View style={{ flexDirection: 'row' }}>
        {modes.map((mode) => {
          const isSelected = mode.value === themeMode;
          
          return (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.modeOption,
                isSelected ? styles.modeOptionSelected : styles.modeOptionUnselected,
              ]}
              onPress={() => setThemeMode(mode.value)}
            >
              <Text
                style={[
                  styles.modeText,
                  isSelected ? styles.modeTextSelected : styles.modeTextUnselected,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Theme</Text>
        {renderThemeStyleOptions()}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        {renderThemeModeOptions()}
      </View>
    </View>
  );
};

export default ThemeSelector;
