import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import ProfileDisplay from '../../src/features/profile/components/ProfileDisplay';
import ProfileForm from '../../src/features/profile/components/ProfileForm';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useLanguageContext } from '../../src/shared/context/LanguageContext';
import { useThemeContext } from '../../src/shared/context/ThemeContext';

export default function ProfilePage() {
  const { profile, isLoading, error, updateProfile } = useProfile();
  const { currentTheme } = useThemeContext();
  const { t } = useLanguageContext();

  const handleProfileSave = (data: any) => {
    updateProfile(data);
  };

  // Navigation is now handled by the form component

  const styles = createStyles(currentTheme);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')} profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('settings.error')}: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {profile && (
          <>
            <ProfileDisplay profile={profile} testID="profile-display" />
            <ProfileForm
              initialData={profile}
              onSave={handleProfileSave}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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