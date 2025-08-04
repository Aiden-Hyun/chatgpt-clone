import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';

/**
 * Test component to showcase all enhanced semantic color tokens
 * Use this to test and visualize the new color system
 */
export const SemanticColorTest = () => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold as '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    colorCard: {
      width: 100,
      height: 80,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      ...theme.shadows.light,
    },
    colorLabel: {
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center',
    },
    button: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
    },
    statusCard: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
    },
    statusTitle: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.xs,
    },
    statusMessage: {
      fontSize: theme.fontSizes.sm,
      opacity: 0.8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>🎨 Enhanced Semantic Color Test</Text>
      
      {/* Status Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Status Colors</Text>
        
        {/* Success */}
        <View style={[styles.statusCard, {
          backgroundColor: theme.colors.status.success.background,
          borderColor: theme.colors.status.success.border,
        }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.status.success.primary }]}>
            ✅ Success Message
          </Text>
          <Text style={[styles.statusMessage, { color: theme.colors.status.success.primary }]}>
            This is a success message using semantic colors
          </Text>
        </View>

        {/* Error */}
        <View style={[styles.statusCard, {
          backgroundColor: theme.colors.status.error.background,
          borderColor: theme.colors.status.error.border,
        }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.status.error.primary }]}>
            ❌ Error Message
          </Text>
          <Text style={[styles.statusMessage, { color: theme.colors.status.error.primary }]}>
            This is an error message using semantic colors
          </Text>
        </View>

        {/* Warning */}
        <View style={[styles.statusCard, {
          backgroundColor: theme.colors.status.warning.background,
          borderColor: theme.colors.status.warning.border,
        }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.status.warning.primary }]}>
            ⚠️ Warning Message
          </Text>
          <Text style={[styles.statusMessage, { color: theme.colors.status.warning.primary }]}>
            This is a warning message using semantic colors
          </Text>
        </View>

        {/* Info */}
        <View style={[styles.statusCard, {
          backgroundColor: theme.colors.status.info.background,
          borderColor: theme.colors.status.info.border,
        }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.status.info.primary }]}>
            ℹ️ Info Message
          </Text>
          <Text style={[styles.statusMessage, { color: theme.colors.status.info.primary }]}>
            This is an info message using semantic colors
          </Text>
        </View>

        {/* Neutral */}
        <View style={[styles.statusCard, {
          backgroundColor: theme.colors.status.neutral.background,
          borderColor: theme.colors.status.neutral.border,
        }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.status.neutral.primary }]}>
            🔘 Neutral Message
          </Text>
          <Text style={[styles.statusMessage, { color: theme.colors.status.neutral.primary }]}>
            This is a neutral message using semantic colors
          </Text>
        </View>
      </View>

      {/* Interactive Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖱️ Interactive Buttons</Text>
        
        <TouchableOpacity style={[styles.button, {
          backgroundColor: theme.colors.status.success.primary,
        }]}>
          <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
            Success Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, {
          backgroundColor: theme.colors.status.error.primary,
        }]}>
          <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
            Error Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, {
          backgroundColor: theme.colors.status.warning.primary,
        }]}>
          <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
            Warning Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, {
          backgroundColor: theme.colors.status.info.primary,
        }]}>
          <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
            Info Button
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, {
          backgroundColor: theme.colors.interactive.disabled.primary,
        }]} disabled>
          <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
            Disabled Button
          </Text>
        </TouchableOpacity>
      </View>

      {/* Color Intensity Levels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Color Intensity Levels</Text>
        
        <Text style={[styles.sectionTitle, { fontSize: theme.fontSizes.sm }]}>Success Colors</Text>
        <View style={styles.colorGrid}>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.success.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Primary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.success.secondary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Secondary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.success.tertiary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Tertiary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.success.background }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.status.success.primary }]}>Background</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.success.border }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Border</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { fontSize: theme.fontSizes.sm }]}>Error Colors</Text>
        <View style={styles.colorGrid}>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.error.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Primary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.error.secondary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Secondary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.error.tertiary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Tertiary</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.error.background }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.status.error.primary }]}>Background</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.status.error.border }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Border</Text>
          </View>
        </View>
      </View>

      {/* Feedback Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Feedback Colors</Text>
        
        <View style={styles.colorGrid}>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.feedback.loading.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Loading</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.feedback.highlight.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Highlight</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.feedback.selection.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Selection</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.feedback.overlay.medium }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.inverted }]}>Overlay</Text>
          </View>
        </View>
      </View>

      {/* Interactive States */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👆 Interactive States</Text>
        
        <View style={styles.colorGrid}>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.interactive.hover.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Hover</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.interactive.pressed.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Pressed</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.interactive.focus.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Focus</Text>
          </View>
          <View style={[styles.colorCard, { backgroundColor: theme.colors.interactive.disabled.primary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text.primary }]}>Disabled</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SemanticColorTest; 