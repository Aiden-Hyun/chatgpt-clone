import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    CustomAlert,
    LanguageSelector,
    ThemedButton,
    useCustomAlert,
    useToast
} from '../src/shared/components';
import { useLanguageContext } from '../src/shared/context/LanguageContext';
import { useAppTheme } from '../src/shared/hooks';

export default function DesignShowcaseScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { showSuccessAlert, showErrorAlert, alert, hideAlert } = useCustomAlert();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const handleBack = () => {
    router.push('/');
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
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
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.light,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    row: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.md,
      flexWrap: 'wrap' as const,
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
    warningButton: {
      backgroundColor: theme.colors.status.warning.primary,
    },
    warningButtonText: {
      color: theme.colors.text.primary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.light,
    },
    label: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      fontWeight: theme.fontWeights.medium as '500',
    },
    chatInputContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.light,
    },
    chatInput: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      minHeight: 40,
      textAlignVertical: 'top' as const,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      alignSelf: 'flex-end' as const,
      ...theme.shadows.light,
    },
    sendButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
    },
    disabledButton: {
      backgroundColor: theme.colors.background.tertiary,
      opacity: 0.5,
    },
    disabledButtonText: {
      color: theme.colors.text.tertiary,
    },
    colorSwatch: {
      width: 60,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
      ...theme.shadows.light,
    },
    colorLabel: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
      fontWeight: theme.fontWeights.medium as '500',
    },
    // Sharp Corners Design Styles
    caption: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.md,
      fontStyle: 'italic' as const,
    },
    sharpButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: 2, // Very slight rounding for professional look
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 120,
      borderWidth: 1,
      ...theme.shadows.light,
    },
    sharpButtonText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center' as const,
    },
    sharpPrimaryButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    sharpPrimaryButtonText: {
      color: theme.colors.text.inverted,
    },
    sharpSecondaryButton: {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border.medium,
    },
    sharpSecondaryButtonText: {
      color: theme.colors.text.primary,
    },
    sharpInput: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background.primary,
      ...theme.shadows.light,
    },
    sharpCard: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    sharpCardTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.sm,
    },
    sharpCardText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.md * 1.4,
    },
    // Additional Sharp Corners Components
    sharpChatInputContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border.medium,
      borderRadius: 2, // Very slight rounding
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.light,
    },
    sharpChatInput: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      minHeight: 40,
      textAlignVertical: 'top' as const,
    },
    sharpSendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 2, // Very slight rounding
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      alignSelf: 'flex-end' as const,
      ...theme.shadows.light,
    },
    sharpSendButtonText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium as '500',
    },
    sharpSuccessButton: {
      backgroundColor: theme.colors.status.success.primary,
      borderColor: theme.colors.status.success.primary,
    },
    sharpSuccessButtonText: {
      color: theme.colors.text.inverted,
    },
    sharpErrorButton: {
      backgroundColor: theme.colors.status.error.primary,
      borderColor: theme.colors.status.error.primary,
    },
    sharpErrorButtonText: {
      color: theme.colors.text.inverted,
    },
    sharpMessageContainer: {
      marginTop: theme.spacing.md,
    },
    sharpUserMessage: {
      backgroundColor: theme.colors.primary,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-end' as const,
      maxWidth: '80%' as any,
      ...theme.shadows.light,
    },
    sharpUserMessageText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
    },
    sharpAssistantMessage: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-start' as const,
      maxWidth: '80%' as any,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.light,
    },
    sharpAssistantMessageText: {
      color: theme.colors.text.primary,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
    },
    // Sharp Corners Alert Demo Styles
    sharpToastDemo: {
      marginBottom: theme.spacing.md,
    },
    sharpToastContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.md,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.medium,
    },
    sharpErrorToastContainer: {
      borderColor: theme.colors.status.error.primary,
      backgroundColor: theme.colors.status.error.background,
    },
    sharpToastIcon: {
      width: 24,
      height: 24,
      borderRadius: 2, // Very slight rounding
      backgroundColor: theme.colors.status.success.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.spacing.md,
    },
    sharpErrorToastIcon: {
      backgroundColor: theme.colors.status.error.primary,
    },
    sharpToastIconText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.bold as '700',
    },
    sharpToastContent: {
      flex: 1,
    },
    sharpToastTitle: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.xs,
    },
    sharpToastMessage: {
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
    },
    sharpAlertDialogDemo: {
      marginTop: theme.spacing.md,
    },
    sharpAlertOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.lg,
    },
    sharpAlertDialog: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: 2, // Very slight rounding
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      ...theme.shadows.heavy,
    },
    sharpAlertHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.md,
    },
    sharpAlertIcon: {
      width: 32,
      height: 32,
      borderRadius: 2, // Very slight rounding
      backgroundColor: theme.colors.status.success.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.spacing.md,
    },
    sharpSuccessAlertIcon: {
      backgroundColor: theme.colors.status.success.primary,
    },
    sharpAlertIconText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.bold as '700',
    },
    sharpAlertDialogTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as '600',
    },
    sharpAlertDialogMessage: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.md * 1.4,
      marginBottom: theme.spacing.lg,
    },
    sharpAlertButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
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
              <ThemedButton variant="primary" size="medium">
                Primary
              </ThemedButton>
              <ThemedButton variant="primary" size="medium" disabled>
                Disabled
              </ThemedButton>
            </View>

            <Text style={styles.label}>Secondary Buttons</Text>
            <View style={styles.row}>
              <ThemedButton variant="secondary" size="medium">
                Secondary
              </ThemedButton>
              <ThemedButton variant="secondary" size="medium" disabled>
                Disabled
              </ThemedButton>
            </View>

            <Text style={styles.label}>Outline & Ghost Buttons</Text>
            <View style={styles.row}>
              <ThemedButton variant="outline" size="medium">
                Outline
              </ThemedButton>
              <ThemedButton variant="ghost" size="medium">
                Ghost
              </ThemedButton>
            </View>

            <Text style={styles.label}>Status Buttons</Text>
            <View style={styles.row}>
              <ThemedButton variant="primary" size="medium" style={{ backgroundColor: theme.colors.status.success.primary }}>
                Success
              </ThemedButton>
              <ThemedButton variant="danger" size="medium">
                Danger
              </ThemedButton>
            </View>

            <Text style={styles.label}>Button Sizes</Text>
            <View style={styles.row}>
              <ThemedButton variant="primary" size="small">
                Small
              </ThemedButton>
              <ThemedButton variant="primary" size="medium">
                Medium
              </ThemedButton>
              <ThemedButton variant="primary" size="large">
                Large
              </ThemedButton>
            </View>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Fields</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Text Input</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter text here..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Text style={styles.label}>Chat Input (Multi-line)</Text>
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
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
            <View style={styles.row}>
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
            <Text style={styles.label}>Test different toast types</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.button, styles.successButton]}
                onPress={() => showSuccess('Success toast message!', 3000)}
              >
                <Text style={[styles.buttonText, styles.successButtonText]}>Success</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.errorButton]}
                onPress={() => showError('Error toast message!', 3000)}
              >
                <Text style={[styles.buttonText, styles.errorButtonText]}>Error</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.button, styles.warningButton]}
                onPress={() => showWarning('Warning toast message!', 3000)}
              >
                <Text style={[styles.buttonText, styles.warningButtonText]}>Warning</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => showInfo('Info toast message!', 3000)}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alert Dialogs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Dialogs</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Test different alert types</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.button, styles.successButton]}
                onPress={() => showSuccessAlert('Success', 'This is a success alert message!')}
              >
                <Text style={[styles.buttonText, styles.successButtonText]}>Success Alert</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.errorButton]}
                onPress={() => showErrorAlert('Error', 'This is an error alert message!')}
              >
                <Text style={[styles.buttonText, styles.errorButtonText]}>Error Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sharp Corners Design Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sharp Corners Design (Option B)</Text>
          
          <View style={[styles.card, { borderRadius: 0 }]}>
            <Text style={styles.label}>Professional Business Buttons</Text>
            <Text style={styles.caption}>Square or slightly rounded buttons with clean, structured appearance</Text>
            
            <View style={styles.row}>
              <TouchableOpacity style={[styles.sharpButton, styles.sharpPrimaryButton]}>
                <Text style={[styles.sharpButtonText, styles.sharpPrimaryButtonText]}>Primary Action</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sharpButton, styles.sharpSecondaryButton]}>
                <Text style={[styles.sharpButtonText, styles.sharpSecondaryButtonText]}>Secondary</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Sharp Corner Input Fields</Text>
            <TextInput
              style={[styles.sharpInput, { marginBottom: theme.spacing.sm }]}
              placeholder="Enter business data..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Text style={styles.label}>Professional Cards</Text>
            <View style={[styles.sharpCard, { marginBottom: theme.spacing.md }]}>
              <Text style={styles.sharpCardTitle}>Business Report</Text>
              <Text style={styles.sharpCardText}>Clean, structured layout with sharp corners for professional appearance.</Text>
            </View>

            <Text style={styles.label}>Sharp Corner Switches</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Enable Feature</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                trackColor={{ false: theme.colors.border.light, true: theme.colors.primary }}
                thumbColor={switchValue ? theme.colors.button.text : theme.colors.text.secondary}
              />
            </View>

            <Text style={styles.label}>Sharp Corner Chat Input</Text>
            <View style={styles.sharpChatInputContainer}>
              <TextInput
                style={styles.sharpChatInput}
                placeholder="Type a professional message..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.sharpSendButton}>
                <Text style={styles.sharpSendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Sharp Corner Alert Examples</Text>
            <Text style={styles.caption}>Demo of how Sharp Corners alerts would look (visual examples)</Text>
            
            {/* Demo Sharp Corner Toast Alert */}
            <View style={styles.sharpToastDemo}>
              <View style={styles.sharpToastContainer}>
                <View style={styles.sharpToastIcon}>
                  <Text style={styles.sharpToastIconText}>✓</Text>
                </View>
                <View style={styles.sharpToastContent}>
                  <Text style={styles.sharpToastTitle}>Success</Text>
                  <Text style={styles.sharpToastMessage}>Professional success message with sharp corners</Text>
                </View>
              </View>
            </View>

            {/* Demo Sharp Corner Error Toast */}
            <View style={styles.sharpToastDemo}>
              <View style={[styles.sharpToastContainer, styles.sharpErrorToastContainer]}>
                <View style={[styles.sharpToastIcon, styles.sharpErrorToastIcon]}>
                  <Text style={styles.sharpToastIconText}>✕</Text>
                </View>
                <View style={styles.sharpToastContent}>
                  <Text style={styles.sharpToastTitle}>Error</Text>
                  <Text style={styles.sharpToastMessage}>Professional error message with sharp corners</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Sharp Corner Alert Dialog Demo</Text>
            <Text style={styles.caption}>Visual example of Sharp Corners alert dialog</Text>
            
            {/* Demo Sharp Corner Alert Dialog */}
            <View style={styles.sharpAlertDialogDemo}>
              <View style={styles.sharpAlertOverlay}>
                <View style={styles.sharpAlertDialog}>
                  <View style={styles.sharpAlertHeader}>
                    <View style={[styles.sharpAlertIcon, styles.sharpSuccessAlertIcon]}>
                      <Text style={styles.sharpAlertIconText}>✓</Text>
                    </View>
                    <Text style={styles.sharpAlertDialogTitle}>Success</Text>
                  </View>
                  <Text style={styles.sharpAlertDialogMessage}>
                    This is a professional success alert dialog with sharp corners and structured layout.
                  </Text>
                  <View style={styles.sharpAlertButtons}>
                    <TouchableOpacity style={[styles.sharpButton, styles.sharpSecondaryButton, { flex: 1, marginRight: theme.spacing.sm }]}>
                      <Text style={[styles.sharpButtonText, styles.sharpSecondaryButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.sharpButton, styles.sharpSuccessButton, { flex: 1 }]}>
                      <Text style={[styles.sharpButtonText, styles.sharpSuccessButtonText]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Sharp Corner Message Bubbles</Text>
            <View style={styles.sharpMessageContainer}>
              <View style={styles.sharpUserMessage}>
                <Text style={styles.sharpUserMessageText}>Professional user message with sharp corners</Text>
              </View>
              <View style={styles.sharpAssistantMessage}>
                <Text style={styles.sharpAssistantMessageText}>Professional assistant response with structured layout</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Color Palette Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Theme Colors</Text>
            <View style={styles.row}>
              <View style={styles.row}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
                <Text style={styles.colorLabel}>Primary</Text>
              </View>
              <View style={styles.row}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.status.success.primary }]} />
                <Text style={styles.colorLabel}>Success</Text>
              </View>
              <View style={styles.row}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.status.error.primary }]} />
                <Text style={styles.colorLabel}>Error</Text>
              </View>
              <View style={styles.row}>
                <View style={[styles.colorSwatch, { backgroundColor: theme.colors.status.warning.primary }]} />
                <Text style={styles.colorLabel}>Warning</Text>
              </View>
            </View>
          </View>
        </View>
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