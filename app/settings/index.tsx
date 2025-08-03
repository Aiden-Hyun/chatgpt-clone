import React from 'react';
import { ScrollView, SafeAreaView, Text, TouchableOpacity, View, Switch, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useLogout, useUserInfo, useUpdateProfile } from '../../src/features/auth';
import { LanguageSelector } from '../../src/shared/components';
import { useLanguageContext } from '../../src/shared/context/LanguageContext';
import { useAppTheme } from '../../src/shared/hooks';
import { createSettingsStyles } from './settings.styles';

export default function SettingsScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { userName, userEmail, refresh } = useUserInfo();
  const { logout, isLoggingOut } = useLogout();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const styles = createSettingsStyles();

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userName || '');

  // Update editedName when userName changes
  React.useEffect(() => {
    setEditedName(userName || '');
  }, [userName]);

  const handleBack = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleNameEdit = () => {
    console.log('✏️ Edit button pressed!');
    setIsEditingName(true);
    setEditedName(userName || '');
  };

  const handleNameSave = async () => {
    console.log('🔘 Save button clicked!');
    
    if (editedName.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    console.log('💾 Starting name save with:', editedName.trim());
    Alert.alert('Debug', `Attempting to save name: ${editedName.trim()}`);
    
    try {
      console.log('🔄 Calling updateProfile...');
      const result = await updateProfile({ display_name: editedName.trim() });
      console.log('✅ UpdateProfile result:', result);
      
      // Small delay to ensure database update is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh user info to get the updated name
      console.log('🔄 Refreshing user info...');
      await refresh();
      console.log('✅ User info refreshed');
      
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('❌ Profile update error in try-catch:', error);
      Alert.alert('Error', `Failed to update name: ${error.message}`);
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
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Name</Text>
              {isEditingName ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={editedName}
                    onChangeText={(text) => {
                      console.log('📝 TextInput changed to:', text);
                      setEditedName(text);
                    }}
                    placeholder="Enter your name"
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoFocus
                    onBlur={handleNameCancel}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('🔘 Save button pressed!');
                      handleNameSave();
                    }} 
                    style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                    disabled={isUpdating}
                  >
                    <Text style={styles.saveButtonText}>
                      {isUpdating ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleNameEdit} style={styles.editableValue}>
                  <Text style={styles.settingValue}>{userName || 'Not set'}</Text>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{userEmail || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Language</Text>
              <LanguageSelector style={styles.languageSelector} />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                thumbColor={notificationsEnabled ? theme.colors.button.text : theme.colors.text.secondary}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                thumbColor={darkModeEnabled ? theme.colors.button.text : theme.colors.text.secondary}
              />
            </View>
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Clear All Conversations</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.settingValue}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingLabel}>Support</Text>
              <Text style={styles.settingValue}>→</Text>
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
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
} 