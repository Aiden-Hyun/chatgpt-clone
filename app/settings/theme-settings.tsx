import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../src/components/ui';
import { ThemeSettingsSection, useAppTheme } from '../../src/features/theme';

export default function ThemeSettingsScreen() {
  const theme = useAppTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    headerSpacer: {
      width: 40, // Balance the back button width
    },
    scrollView: {
      flex: 1,
    },
  });

  const handleBack = () => {
    try {
      const canGoBack = (router as any).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/settings');
      }
    } catch {
      router.replace('/settings');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold">Theme Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Theme Settings Section */}
        <ThemeSettingsSection />
        
        {/* Theme Showcase Links */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing.xl,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            marginHorizontal: theme.spacing.md,
          }}
          onPress={() => router.push('/theme-showcase')}
        >
          <MaterialIcons name="visibility" size={20} color={theme.colors.text.inverted} style={{ marginRight: theme.spacing.sm }} />
          <Text 
            style={{
              color: theme.colors.text.inverted,
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Preview Glassmorphism Theme
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            backgroundColor: '#6366F1', // Indigo for claymorphism
            borderRadius: theme.borderRadius.md,
            marginHorizontal: theme.spacing.md,
          }}
          onPress={() => router.push('/claymorphism-showcase')}
        >
          <MaterialIcons name="visibility" size={20} color="#FFFFFF" style={{ marginRight: theme.spacing.sm }} />
          <Text 
            style={{
              color: '#FFFFFF',
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Preview Claymorphism Theme
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
