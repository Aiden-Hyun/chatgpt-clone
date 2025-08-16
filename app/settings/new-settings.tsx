import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { ListItem, Text } from '../../src/components/ui';
import { useLogout, useUserInfo } from '../../src/features/auth';
import { useAppTheme } from '../../src/features/theme/theme';
import { createNewSettingsStyles } from './new-settings.styles';

export default function NewSettingsScreen() {
  const theme = useAppTheme();
  const styles = createNewSettingsStyles(theme);
  const { userName, email } = useUserInfo();
  const userPhoneNumber = '+15879665231'; // Hardcoded for demo
  const { logout, isLoggingOut } = useLogout();

  const handleBack = () => {
    try {
      const canGoBack = (router as any).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/chat');
      }
    } catch {
      router.replace('/chat');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  // Get first letter of name for avatar
  const getInitial = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold">Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text variant="h1" weight="semibold" style={styles.avatarText}>
              {getInitial()}
            </Text>
          </View>
          <Text variant="h2" weight="bold" style={styles.userName}>
            {userName || 'User'}
          </Text>
        </View>

        {/* User Info Section */}
        <View style={styles.section}>
          <ListItem
            variant="settings"
            title="Email"
            subtitle={email || 'Not set'}
            leftElement={
              <MaterialIcons name="email" size={24} color={theme.colors.text.primary} />
            }
          />
          <ListItem
            variant="settings"
            title="Phone number"
            subtitle={userPhoneNumber || '+15879665231'}
            leftElement={
              <MaterialIcons name="phone" size={24} color={theme.colors.text.primary} />
            }
          />
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <ListItem
            variant="settings"
            title="Manage Subscription"
            subtitle="ChatGPT Plus"
            leftElement={
              <MaterialIcons name="add-box" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to subscription management')}
          />
          <ListItem
            variant="settings"
            title="Upgrade to Pro"
            leftElement={
              <MaterialIcons name="star" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to upgrade options')}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ListItem
            variant="settings"
            title="Connectors"
            leftElement={
              <MaterialIcons name="link" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to connectors')}
          />
          <ListItem
            variant="settings"
            title="Personalization"
            leftElement={
              <MaterialIcons name="person" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to personalization')}
          />
          <ListItem
            variant="settings"
            title="Theme & Appearance"
            leftElement={
              <MaterialIcons name="palette" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => router.push('/settings/theme-settings')}
          />
          <ListItem
            variant="settings"
            title="Data Controls"
            leftElement={
              <MaterialIcons name="storage" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to data controls')}
          />
          <ListItem
            variant="settings"
            title="Notifications"
            leftElement={
              <MaterialIcons name="notifications" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to notifications')}
          />
          <ListItem
            variant="settings"
            title="Voice"
            leftElement={
              <MaterialIcons name="mic" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to voice settings')}
          />
          <ListItem
            variant="settings"
            title="Security"
            leftElement={
              <MaterialIcons name="security" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to security')}
          />
          <ListItem
            variant="settings"
            title="About"
            leftElement={
              <MaterialIcons name="info" size={24} color={theme.colors.text.primary} />
            }
            rightElement={
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            }
            onPress={() => console.log('Navigate to about')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <MaterialIcons name="logout" size={20} color={theme.colors.status.error.primary} />
          <Text 
            style={styles.logoutText}
            color={theme.colors.status.error.primary}
          >
            Sign out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
