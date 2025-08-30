import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../theme';

import { ThemeSelector } from './ThemeSelector';

interface ThemeSettingsSectionProps {
  // Optional props can be added here
}

/**
 * Theme settings section component for the settings screen
 */
export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = () => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      fontSize: theme.typography.fontSizes.xl,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    description: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Appearance</Text>
      <Text style={styles.description}>
        Customize the look and feel of the application by selecting a theme and appearance mode.
      </Text>
      <ThemeSelector />
    </View>
  );
};

export default ThemeSettingsSection;
