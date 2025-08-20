import { Button, Card, Input, ListItem, Text } from '@/components/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Switch, View, SafeAreaView, Platform } from 'react-native';
import { CustomAlert, useCustomAlert, useToast } from '../../src/features/alert';
import { useLogout, useUpdateProfile, useUserInfo } from '../../src/features/auth';
import { LanguageSelector, useLanguageContext } from '../../src/features/language';
import { useAppTheme, useThemeMode, useThemeStyle } from '../../src/features/theme';
import { createSettingsStyles } from './settings.styles';

export default function SettingsScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { themeStyle, setThemeStyle } = useThemeStyle();
  const { userName, email, refresh } = useUserInfo();
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
        <Button 
          variant="ghost"
          onPress={handleBack}
          containerStyle={styles.backButton}
          leftIcon={<MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />}
        />
        <Text variant="h2" weight="semibold" style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        bounces={Platform.OS === 'ios'}
        alwaysBounceVertical={Platform.OS === 'ios'}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.account')}</Text>
          <Card variant="default" padding="md" containerStyle={styles.card}>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <Input
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder={t('settings.name')}
                  variant="filled"
                  autoFocus
                  onBlur={() => {
                    console.log('👁️ TextInput blurred');
                    // Don't cancel on blur - let user press save button
                  }}
                />
                <View style={styles.editButtons}>
                  <Button 
                    label={isUpdating ? t('common.loading') : t('common.save')}
                    onPress={handleNameSave}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    size="sm"
                    containerStyle={styles.saveButton}
                  />
                  <Button 
                    variant="outline"
                    label={t('common.cancel')}
                    onPress={handleNameCancel}
                    size="sm"
                    containerStyle={styles.cancelButton}
                  />
                </View>
              </View>
            ) : (
              <ListItem
                variant="settings"
                title={t('settings.name')}
                subtitle={userName || t('settings.not_set')}
                rightElement={
                  <Button 
                    variant="ghost"
                    label={t('common.edit')}
                    onPress={handleNameEdit}
                    size="sm"
                  />
                }
              />
            )}
            
            <ListItem
              variant="settings"
              title={t('settings.email')}
              subtitle={email || t('settings.not_set')}
            />
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <Card variant="default" padding="md" containerStyle={styles.card}>
            <ListItem
              variant="settings"
              title={t('settings.language')}
              rightElement={<LanguageSelector style={styles.languageSelector} />}
            />
            
            <ListItem
              variant="settings"
              title={t('settings.theme')}
              subtitle={`${themeStyle === 'default' ? 'Default' : themeStyle === 'glassmorphism' ? 'Glassmorphism' : 'Claymorphism'} • ${themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}`}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => router.push('/settings/themes')}
            />
            
            {/* Test Toast Button */}
            <ListItem
              variant="settings"
              title="Test Toast"
              subtitle="Tap to test"
              onPress={() => {
                console.log('🧪 Test toast button pressed');
                showSuccess('Test toast message!', 5000);
              }}
            />
            
            <ListItem
              variant="settings"
              title={t('settings.notifications')}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                  thumbColor={notificationsEnabled ? theme.colors.button.text : theme.colors.text.secondary}
                />
              }
            />
          </Card>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.data_privacy')}</Text>
          <Card variant="default" padding="md" containerStyle={styles.card}>
            <ListItem
              variant="settings"
              title={t('settings.export_data')}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => {}}
            />
            <ListItem
              variant="settings"
              title={t('settings.clear_conversations')}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => {}}
            />
            <ListItem
              variant="settings"
              title={t('settings.privacy_policy')}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="h3" weight="semibold" style={styles.sectionTitle}>{t('settings.about')}</Text>
          <Card variant="default" padding="md" containerStyle={styles.card}>
            <ListItem
              variant="settings"
              title={t('settings.version')}
              subtitle="1.0.0"
            />
            <ListItem
              variant="settings"
              title={t('settings.terms_of_service')}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => {}}
            />
            <ListItem
              variant="settings"
              title={t('settings.support')}
              rightElement={<MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          label={isLoggingOut ? t('home.logging_out') : t('home.logout')}
          onPress={handleLogout}
          disabled={isLoggingOut}
          isLoading={isLoggingOut}
          status="error"
          fullWidth
          containerStyle={styles.logoutButton}
        />
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
    </SafeAreaView>
  );
} 