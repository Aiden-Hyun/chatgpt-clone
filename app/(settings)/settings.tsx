import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SettingsForm from '../../src/features/settings/components/SettingsForm';
import { useSettings } from '../../src/features/settings/hooks/useSettings';
import { useLanguageContext } from '../../src/shared/context/LanguageContext';
import { useThemeContext } from '../../src/shared/context/ThemeContext';

export default function SettingsPage() {
  const { settings, isLoading, error, updateSettings } = useSettings();
  const { currentTheme } = useThemeContext();
  const { t } = useLanguageContext();

  const handleSettingsSave = (data: any) => {
    updateSettings(data);
  };

  // Navigation is now handled by the form component

  const styles = createStyles(currentTheme);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('settings.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('settings.error')}: {error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {settings && (
          <SettingsForm
            initialData={settings}
            onSave={handleSettingsSave}
          />
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Remove background color entirely
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.status.error.primary,
    fontSize: 16,
    textAlign: 'center',
  },
}); 