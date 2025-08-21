import { Button, Input, Text } from '@/components/ui';
import { LanguageSelector, useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { getButtonSize } from '@/shared/utils/layout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Switch, TouchableOpacity, View } from 'react-native';

export default function DesignShowcaseScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();

  // State for interactive elements
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [activeSearchButtons, setActiveSearchButtons] = useState<Set<string>>(new Set());

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

  const toggleSearchButton = (buttonId: string) => {
    setActiveSearchButtons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buttonId)) {
        newSet.delete(buttonId);
      } else {
        newSet.add(buttonId);
      }
      return newSet;
    });
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
    },
    backButton: {
      width: getButtonSize('action'),
      height: getButtonSize('action'),
      borderRadius: getButtonSize('action') / 2,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.spacing.md,
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    backButtonText: {
      fontSize: theme.fontSizes.lg,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
    },
    headerTitle: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
    },
    content: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xxxl,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.lg,
      flexWrap: 'wrap' as const,
      gap: theme.spacing.sm,
    },
    button: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 100,
      ...theme.shadows.light,
    },
    buttonText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.medium as '500',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.text.inverted,
    },
    secondaryButton: {
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
    },
    secondaryButtonText: {
      color: theme.colors.text.primary,
    },
    successButton: {
      backgroundColor: theme.colors.status.success.primary,
    },
    successButtonText: {
      color: theme.colors.text.inverted,
    },
    errorButton: {
      backgroundColor: theme.colors.status.error.primary,
    },
    errorButtonText: {
      color: theme.colors.text.inverted,
    },
    infoButton: {
      backgroundColor: theme.colors.status.info.primary,
    },
    infoButtonText: {
      color: theme.colors.text.inverted,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    outlineButtonText: {
      color: theme.colors.primary,
    },
    ghostButton: {
      backgroundColor: 'transparent',
    },
    ghostButtonText: {
      color: theme.colors.primary,
    },
    smallButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minWidth: 80,
    },
    smallButtonText: {
      fontSize: theme.fontSizes.sm,
    },
    mediumButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minWidth: 100,
    },
    mediumButtonText: {
      fontSize: theme.fontSizes.md,
    },
    largeButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      minWidth: 120,
    },
    largeButtonText: {
      fontSize: theme.fontSizes.lg,
    },
    label: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      marginBottom: theme.spacing.lg,
    },
    chatInputContainer: {
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      gap: theme.spacing.sm,
    },
    chatInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      minHeight: 80,
      textAlignVertical: 'top' as const,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    sendButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
    },
    searchButtonRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    searchButtonBase: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
    },
    searchButtonLabel: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as '500',
      flex: 1,
    },
    iconShowcase: {
      alignItems: 'center' as const,
      marginBottom: theme.spacing.md,
    },
    iconLabel: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design Showcase</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Primary Buttons</Text>
            <View style={styles.row}>
              <Button
                label="Primary"
                onPress={() => console.log('Primary button pressed')}
                containerStyle={[styles.button, styles.primaryButton]}
              />
              <Button
                label="Success"
                onPress={() => console.log('Success button pressed')}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error"
                onPress={() => console.log('Error button pressed')}
                containerStyle={[styles.button, styles.errorButton]}
              />
            </View>

            <Text style={styles.label}>Secondary Buttons</Text>
            <View style={styles.row}>
              <Button
                label="Secondary"
                onPress={() => console.log('Secondary button pressed')}
                containerStyle={[styles.button, styles.secondaryButton]}
              />
              <Button
                label="Outline"
                onPress={() => console.log('Outline button pressed')}
                containerStyle={[styles.button, styles.outlineButton]}
              />
              <Button
                label="Ghost"
                onPress={() => console.log('Ghost button pressed')}
                containerStyle={[styles.button, styles.ghostButton]}
              />
            </View>

            <Text style={styles.label}>Button Sizes</Text>
            <View style={styles.row}>
              <Button
                label="Small"
                onPress={() => console.log('Small button pressed')}
                containerStyle={[styles.button, styles.smallButton]}
              />
              <Button
                label="Medium"
                onPress={() => console.log('Medium button pressed')}
                containerStyle={[styles.button, styles.mediumButton]}
              />
              <Button
                label="Large"
                onPress={() => console.log('Large button pressed')}
                containerStyle={[styles.button, styles.largeButton]}
              />
            </View>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Fields</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Text Input</Text>
            <Input
              inputStyle={styles.input}
              placeholder={t('placeholder.enter_text')}
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Text style={styles.label}>Chat Input (Multi-line)</Text>
            <View style={styles.chatInputContainer}>
              <Input
                inputStyle={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Switches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Switches</Text>
          
          <View style={styles.card}>
            <View style={styles.row as any}>
              <Text style={styles.label}>Toggle Switch</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                thumbColor={switchValue ? theme.colors.button.text : theme.colors.text.secondary}
              />
            </View>
          </View>
        </View>

        {/* Language Selector Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language Selector</Text>
          
          <View style={styles.card}>
            <LanguageSelector />
          </View>
        </View>

        {/* Toast Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toast Notifications</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Test different types of toast notifications</Text>
            <View style={styles.row}>
              <Button
                label="Success"
                onPress={() => console.log('Success toast')}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error"
                onPress={() => console.log('Error toast')}
                containerStyle={[styles.button, styles.errorButton]}
              />
              <Button
                label="Info"
                onPress={() => console.log('Info toast')}
                containerStyle={[styles.button, styles.infoButton]}
              />
            </View>
          </View>
        </View>

        {/* Alert Dialogs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Dialogs</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Test different types of alerts</Text>
            <View style={styles.row}>
              <Button
                label="Success Alert"
                onPress={() => console.log('Success alert')}
                containerStyle={[styles.button, styles.successButton]}
              />
              <Button
                label="Error Alert"
                onPress={() => console.log('Error alert')}
                containerStyle={[styles.button, styles.errorButton]}
              />
              <Button
                label="Confirm Alert"
                onPress={() => console.log('Confirm alert')}
                containerStyle={[styles.button, styles.infoButton]}
              />
            </View>
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
} 