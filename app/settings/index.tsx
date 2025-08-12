import { MaterialIcons } from '@expo/vector-icons';

import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CustomAlert, useCustomAlert, useToast } from '../../src/features/alert';
import { useLogout, useUpdateProfile, useUserInfo } from '../../src/features/auth';
import { LanguageSelector, useLanguageContext } from '../../src/features/language';
import { ThemeSelector } from '../../src/features/theme';
import { useAppTheme } from '../../src/features/theme/lib/theme';
import { createSettingsStyles } from './settings.styles';

export default function SettingsScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { userName, userEmail, refresh } = useUserInfo();
  const { logout, isLoggingOut } = useLogout();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { showSuccessAlert, showErrorAlert, alert, hideAlert } = useCustomAlert();
  const { showSuccess } = useToast();
  const styles = createSettingsStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userName || '');

  // Update editedName when userName changes
  React.useEffect(() => {
    setEditedName(userName || '');
  }, [userName]);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditedName(userName || '');
  };

  const handleNameSave = async () => {
    if (editedName.trim() === '') {
      showErrorAlert(t('common.error'), t('settings.name_empty'));
      return;
    }
    
    try {
      const result = await updateProfile({ display_name: editedName.trim() });
      
      // Small delay to ensure database update is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh user info to get the updated name
      await refresh();
      
      setIsEditingName(false);
      showSuccessAlert(t('common.success'), t('settings.name_updated'));
    } catch (error) {
      showErrorAlert(t('common.error'), t('settings.name_update_failed'));
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName(userName || '');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={styles.backButtonText.color} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.name')}</Text>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder={t('settings.name')}
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoFocus
                    onBlur={() => {
                      console.log('👁️ TextInput blurred');
                      // Don't cancel on blur - let user press save button
                    }}
                  />
                  <TouchableOpacity 
                    onPress={handleNameSave}
                    style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                    disabled={isUpdating}
                  >
                    <Text style={styles.saveButtonText}>
                      {isUpdating ? t('common.loading') : t('common.save')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNameCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameContainer}>
                  <Text style={styles.settingValue}>{userName || t('settings.not_set')}</Text>
                  <TouchableOpacity onPress={handleNameEdit} style={styles.editButton}>
                    <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.email')}</Text>
              <Text style={styles.settingValue}>{userEmail || t('settings.not_set')}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
              <LanguageSelector style={styles.languageSelector} />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.theme')}</Text>
              <ThemeSelector style={styles.themeSelector} />
            </View>
            
            {/* Test Toast Button */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                console.log('🧪 Test toast button pressed');
                showSuccess('Test toast message!', 5000);
              }}
            >
              <Text style={styles.settingLabel}>Test Toast</Text>
              <Text style={styles.settingValue}>Tap to test</Text>
            </TouchableOpacity>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.notifications')}</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                thumbColor={notificationsEnabled ? theme.colors.button.text : theme.colors.text.secondary}
              />
            </View>

          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data_privacy')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.export_data')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.clear_conversations')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.privacy_policy')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.version')}</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.terms_of_service')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.support')}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? t('home.logging_out') : t('home.logout')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={() => {
          alert.onConfirm?.();
          hideAlert();
        }}
        onCancel={() => {
          alert.onCancel?.();
          hideAlert();
        }}
      />

      {/* Toast Notification */}
      {/* The Toast component is now handled globally, so this section is removed */}
    </SafeAreaView>
  );
} 