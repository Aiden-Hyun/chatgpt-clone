import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GlassmorphismDemo, Text } from '../src/components/ui';
import { useThemeContext, useThemeStyle } from '../src/features/theme';

export default function ThemeShowcaseScreen() {
  const { themeStyle, setThemeStyle } = useThemeStyle();
  const { currentTheme } = useThemeContext();
  
  // Set glassmorphism theme when entering this screen
  useEffect(() => {
    const previousTheme = themeStyle;
    
    // Switch to glassmorphism theme
    setThemeStyle('glassmorphism');
    
    // Restore previous theme when leaving
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
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border.light,
    },
    backButton: {
      padding: currentTheme.spacing.sm,
      marginRight: currentTheme.spacing.md,
    },
    headerSpacer: {
      width: 40, // Balance the back button width
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
    gradientBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
    },
    circle1: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      top: -100,
      right: -100,
    },
    circle2: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      bottom: 100,
      left: -50,
    },
    circle3: {
      position: 'absolute',
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      bottom: -100,
      right: 50,
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
      {/* Decorative background for glassmorphism effect */}
      <View style={styles.gradientBackground}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold">Glassmorphism Theme</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glassmorphism Theme Showcase</Text>
          <Text style={styles.description}>
            This screen demonstrates the glassmorphism design trend with frosted glass effects,
            transparency, and subtle borders. Notice how elements appear to float above the
            colorful background with a blurred glass-like appearance.
          </Text>
          
          {/* Demo component */}
          <GlassmorphismDemo />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
