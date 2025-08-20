import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../src/components/ui';
import { useThemeStyle } from '../src/features/theme/theme';
import { getButtonSize, getHeaderHeight } from '../src/shared/utils/layout';

export default function ClaymorphismShowcaseScreen() {
  const { themeStyle, setThemeStyle } = useThemeStyle();
  const router = useRouter();
  const currentTheme = themeStyle === 'claymorphism' 
    ? require('../src/features/theme/themes/claymorphism').claymorphismTheme.theme.light
    : themeStyle === 'glassmorphism'
    ? require('../src/features/theme/themes/glassmorphism').glassmorphismTheme.theme.light
    : require('../src/features/theme/themes/default').defaultTheme.light;

  // Import the demo component based on theme
  const ClaymorphismDemo = require('../src/features/theme/components/ClaymorphismDemo').ClaymorphismDemo;

  // Store the previous theme to restore it when leaving
  useEffect(() => {
    const previousTheme = themeStyle;
    return () => {
      setThemeStyle(previousTheme);
    };
  }, []);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.md,
      paddingVertical: currentTheme.spacing.md,
      paddingTop: getHeaderHeight(), // Use utility for consistent header height
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border.light,
    },
    backButton: {
      padding: currentTheme.spacing.sm,
      marginRight: currentTheme.spacing.md,
      // Use consistent button size
      minWidth: getButtonSize('action'),
      minHeight: getButtonSize('action'),
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSpacer: {
      width: getButtonSize('header'), // Use consistent button size for centering
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: currentTheme.spacing.md,
    },
    sectionTitle: {
      fontSize: currentTheme.fontSizes.xl,
      fontWeight: currentTheme.fontWeights.bold,
      color: currentTheme.colors.text.primary,
      marginBottom: currentTheme.spacing.md,
    },
    description: {
      fontSize: currentTheme.fontSizes.md,
      color: currentTheme.colors.text.secondary,
      marginBottom: currentTheme.spacing.xl,
    },
    // Decorative background elements for visual interest
    decorativeBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    decorativeShape1: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(99, 102, 241, 0.1)', // Indigo with low opacity
      top: -50,
      right: -50,
    },
    decorativeShape2: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(236, 72, 153, 0.1)', // Pink with low opacity
      bottom: 100,
      left: -50,
    },
    decorativeShape3: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green with low opacity
      bottom: -50,
      right: 20,
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
      {/* Decorative background for visual interest */}
      <View style={styles.decorativeBackground}>
        <View style={styles.decorativeShape1} />
        <View style={styles.decorativeShape2} />
        <View style={styles.decorativeShape3} />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold">Claymorphism Theme</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Claymorphism Theme Showcase</Text>
          <Text style={styles.description}>
            This screen demonstrates the claymorphism design trend with soft, puffy 3D elements,
            vibrant colors, and extra rounded corners. The clay-like appearance creates a playful,
            tactile interface that's both modern and friendly.
          </Text>
          
          {/* Demo component */}
          <ClaymorphismDemo />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
