import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemeMode, ThemeWithMetadata } from '../../interfaces/theme';
import { useAppTheme, useThemeMode, useThemeStyle } from '../theme';

/**
 * Component for selecting theme style and mode
 */
export const ThemeSelector: React.FC = () => {
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { themeStyle, setThemeStyle, availableThemes } = useThemeStyle();

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

  // Create styles using current theme
  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold as '600',
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
      width: 140,
      height: 160,
      margin: theme.spacing.xs,
      borderRadius: theme.borders.radius.md,
      overflow: 'hidden',
      borderWidth: theme.borders.widths.medium,
      backgroundColor: theme.colors.background.secondary,
    },
    themeCardSelected: {
      borderColor: theme.colors.primary,
      borderWidth: theme.borders.widths.medium,
    },
    themeCardUnselected: {
      borderColor: theme.borders.colors.light,
    },
    themePreview: {
      flex: 1,
      padding: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorPalette: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: theme.spacing.xs,
    },
    colorSwatch: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.borders.colors.light,
    },
    themeLabel: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium as '500',
      textAlign: 'center',
      padding: theme.spacing.xs,
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
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
      borderColor: theme.borders.colors.light,
    },
    modeText: {
      fontSize: theme.typography.fontSizes.md,
      fontWeight: theme.typography.fontWeights.medium as '500',
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
            const colors = getThemeColors(themeOption);
            
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  isSelected ? styles.themeCardSelected : styles.themeCardUnselected,
                ]}
                onPress={() => setThemeStyle(themeOption.id)}
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
                  
                  {/* Theme preview element */}
                  <View
                    style={{
                      width: 50,
                      height: 30,
                      borderRadius: theme.borders.radius.sm,
                      backgroundColor: colors.primary,
                      marginBottom: theme.spacing.xs,
                    }}
                  />
                  
                  {/* Small accent element */}
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      borderRadius: theme.borders.radius.xs,
                      backgroundColor: colors.accent,
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
