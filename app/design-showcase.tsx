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
    // Floating Action Design Styles (Option C)
    floatingButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      borderRadius: 16, // Material design rounded corners
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minWidth: 140,
      borderWidth: 0,
      elevation: 8, // Android elevation
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    floatingButtonText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      fontWeight: theme.fontWeights.medium as '500',
      textAlign: 'center' as const,
    },
    floatingPrimaryButton: {
      backgroundColor: '#6366F1', // Modern indigo
      shadowColor: 'rgba(99, 102, 241, 0.4)',
    },
    floatingPrimaryButtonText: {
      color: '#FFFFFF',
    },
    floatingSecondaryButton: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    floatingSecondaryButtonText: {
      color: '#374151',
    },
    floatingSuccessButton: {
      backgroundColor: '#10B981', // Modern emerald
      shadowColor: 'rgba(16, 185, 129, 0.4)',
    },
    floatingSuccessButtonText: {
      color: '#FFFFFF',
    },
    floatingErrorButton: {
      backgroundColor: '#EF4444', // Modern red
      shadowColor: 'rgba(239, 68, 68, 0.4)',
    },
    floatingErrorButtonText: {
      color: '#FFFFFF',
    },
    floatingInput: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12, // Material design rounded corners
      padding: theme.spacing.lg,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: '#374151',
      backgroundColor: '#FFFFFF',
      elevation: 2,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    floatingCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16, // Material design rounded corners
      padding: theme.spacing.xl,
      borderWidth: 0,
      elevation: 4,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    floatingCardTitle: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: '#111827',
      fontWeight: theme.fontWeights.semibold as '600',
      marginBottom: theme.spacing.sm,
    },
    floatingCardText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: '#6B7280',
      lineHeight: theme.fontSizes.md * 1.5,
    },
    floatingChatInputContainer: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 20, // Material design rounded corners
      backgroundColor: '#FFFFFF',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      elevation: 3,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    floatingChatInput: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: '#374151',
      minHeight: 40,
      textAlignVertical: 'top' as const,
    },
    floatingSendButton: {
      backgroundColor: '#6366F1',
      borderRadius: 20, // Material design rounded corners
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      elevation: 4,
      shadowColor: 'rgba(99, 102, 241, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      minWidth: 80,
      alignItems: 'center' as const,
    },
    floatingSendButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.medium as '500',
      fontFamily: theme.fontFamily.primary,
    },
    floatingToastDemo: {
      marginBottom: theme.spacing.lg,
    },
    floatingToastContainer: {
      backgroundColor: '#10B981',
      borderRadius: 12, // Material design rounded corners
      padding: theme.spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      elevation: 6,
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    floatingErrorToastContainer: {
      backgroundColor: '#EF4444',
      shadowColor: 'rgba(239, 68, 68, 0.3)',
    },
    floatingToastIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    floatingErrorToastIcon: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    floatingToastIconText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.bold as '700',
    },
    floatingToastContent: {
      flex: 1,
    },
    floatingToastTitle: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.semibold as '600',
      fontFamily: theme.fontFamily.primary,
      marginBottom: 2,
    },
    floatingToastMessage: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: theme.fontSizes.sm,
      fontFamily: theme.fontFamily.primary,
    },
    floatingAlertDialogDemo: {
      marginBottom: theme.spacing.lg,
    },
    floatingAlertOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    floatingAlertDialog: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20, // Material design rounded corners
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
      maxWidth: '80%' as any,
      minWidth: 280,
      elevation: 8,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    floatingAlertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    floatingAlertIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#10B981',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.spacing.md,
      elevation: 2,
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    floatingSuccessAlertIcon: {
      backgroundColor: '#10B981',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
    },
    floatingAlertIconText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.bold as '700',
    },
    floatingAlertDialogTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold as '600',
      color: '#111827',
      textAlign: 'center' as const,
      fontFamily: theme.fontFamily.primary,
    },
    floatingAlertDialogMessage: {
      fontSize: theme.fontSizes.md,
      color: '#6B7280',
      textAlign: 'center' as const,
      lineHeight: 20,
      fontFamily: theme.fontFamily.primary,
      marginBottom: theme.spacing.lg,
    },
    floatingAlertButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    floatingMessageContainer: {
      marginBottom: theme.spacing.lg,
    },
    floatingUserMessage: {
      backgroundColor: '#6366F1',
      borderRadius: 20, // Material design rounded corners
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-end',
      maxWidth: '80%' as any,
      elevation: 3,
      shadowColor: 'rgba(99, 102, 241, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    floatingUserMessageText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      lineHeight: theme.fontSizes.md * 1.4,
    },
    floatingAssistantMessage: {
      backgroundColor: '#F3F4F6',
      borderRadius: 20, // Material design rounded corners
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-start',
      maxWidth: '80%' as any,
      elevation: 2,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    floatingAssistantMessageText: {
      color: '#374151',
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      lineHeight: theme.fontSizes.md * 1.4,
    },
    // Clean Article Layout Styles (Option 1)
    articleChatContainer: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    articleUserMessage: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      maxWidth: '70%',
      ...theme.shadows.light,
    },
    articleUserMessageText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      lineHeight: 22,
    },
    articleAIResponseContainer: {
      marginBottom: theme.spacing.xl,
      position: 'relative' as const,
    },
    articleAIAvatar: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.status.info.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      zIndex: 1,
    },
    articleAIAvatarText: {
      color: theme.colors.text.inverted,
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.bold as '700',
    },
    articleAIContent: {
      marginLeft: 32, // Space for avatar
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg, // Space for regenerate button
    },
    articleAIText: {
      color: theme.colors.text.primary,
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      lineHeight: 26,
      textAlign: 'left' as const,
    },
    articleRegenerateButton: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderRadius: 10,
      opacity: 0.6,
    },
    articleRegenerateIcon: {
      color: theme.colors.text.tertiary,
      fontSize: theme.fontSizes.xs,
      fontWeight: theme.fontWeights.medium as '500',
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

        {/* Floating Action Design Section (Option C) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Floating Action Design (Option C)</Text>
          <Text style={styles.caption}>Material design with elevated buttons and modern aesthetics</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>Floating Action Buttons</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.floatingButton, styles.floatingPrimaryButton]}>
                <Text style={[styles.floatingButtonText, styles.floatingPrimaryButtonText]}>Primary</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.floatingButton, styles.floatingSecondaryButton]}>
                <Text style={[styles.floatingButtonText, styles.floatingSecondaryButtonText]}>Secondary</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.floatingButton, styles.floatingSuccessButton]}>
                <Text style={[styles.floatingButtonText, styles.floatingSuccessButtonText]}>Success</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.floatingButton, styles.floatingErrorButton]}>
                <Text style={[styles.floatingButtonText, styles.floatingErrorButtonText]}>Error</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Floating Action Input Field</Text>
            <TextInput
              style={styles.floatingInput}
              placeholder="Enter text here..."
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Floating Action Card</Text>
            <View style={styles.floatingCard}>
              <Text style={styles.floatingCardTitle}>Material Design Card</Text>
              <Text style={styles.floatingCardText}>
                This card demonstrates the Floating Action design with elevated shadows and modern rounded corners.
              </Text>
            </View>

            <Text style={styles.label}>Floating Action Chat Input</Text>
            <View style={styles.floatingChatInputContainer}>
              <TextInput
                style={styles.floatingChatInput}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity style={styles.floatingSendButton}>
                <Text style={styles.floatingSendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Floating Action Toast Demo</Text>
            <Text style={styles.caption}>Visual example of Floating Action toast notifications</Text>
            
            {/* Demo Floating Action Toast */}
            <View style={styles.floatingToastDemo}>
              <View style={styles.floatingToastContainer}>
                <View style={styles.floatingToastIcon}>
                  <Text style={styles.floatingToastIconText}>✓</Text>
                </View>
                <View style={styles.floatingToastContent}>
                  <Text style={styles.floatingToastTitle}>Success</Text>
                  <Text style={styles.floatingToastMessage}>Modern material design toast with elevated shadows</Text>
                </View>
              </View>
            </View>

            <View style={styles.floatingToastDemo}>
              <View style={[styles.floatingToastContainer, styles.floatingErrorToastContainer]}>
                <View style={[styles.floatingToastIcon, styles.floatingErrorToastIcon]}>
                  <Text style={styles.floatingToastIconText}>✕</Text>
                </View>
                <View style={styles.floatingToastContent}>
                  <Text style={styles.floatingToastTitle}>Error</Text>
                  <Text style={styles.floatingToastMessage}>Modern material design error toast with elevated shadows</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Floating Action Alert Dialog Demo</Text>
            <Text style={styles.caption}>Visual example of Floating Action alert dialog</Text>
            
            {/* Demo Floating Action Alert Dialog */}
            <View style={styles.floatingAlertDialogDemo}>
              <View style={styles.floatingAlertOverlay}>
                <View style={styles.floatingAlertDialog}>
                  <View style={styles.floatingAlertHeader}>
                    <View style={[styles.floatingAlertIcon, styles.floatingSuccessAlertIcon]}>
                      <Text style={styles.floatingAlertIconText}>✓</Text>
                    </View>
                    <Text style={styles.floatingAlertDialogTitle}>Success</Text>
                  </View>
                  <Text style={styles.floatingAlertDialogMessage}>
                    This is a modern material design alert dialog with elevated shadows and rounded corners.
                  </Text>
                  <View style={styles.floatingAlertButtons}>
                    <TouchableOpacity style={[styles.floatingButton, styles.floatingSecondaryButton, { flex: 1, marginRight: theme.spacing.sm }]}>
                      <Text style={[styles.floatingButtonText, styles.floatingSecondaryButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.floatingButton, styles.floatingSuccessButton, { flex: 1 }]}>
                      <Text style={[styles.floatingButtonText, styles.floatingSuccessButtonText]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Floating Action Message Bubbles</Text>
            <View style={styles.floatingMessageContainer}>
              <View style={styles.floatingUserMessage}>
                <Text style={styles.floatingUserMessageText}>Modern user message with material design</Text>
              </View>
              <View style={styles.floatingAssistantMessage}>
                <Text style={styles.floatingAssistantMessageText}>Modern assistant response with elevated design</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clean Article Layout Section (Option 1) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clean Article Layout (Option 1)</Text>
          <Text style={styles.caption}>Full-width text blocks with no borders, like reading an article</Text>
          
          <View style={styles.articleChatContainer}>
            {/* User Message */}
            <View style={styles.articleUserMessage}>
              <Text style={styles.articleUserMessageText}>What can you tell me about React Native?</Text>
            </View>

            {/* AI Response */}
            <View style={styles.articleAIResponseContainer}>
              <View style={styles.articleAIAvatar}>
                <Text style={styles.articleAIAvatarText}>AI</Text>
              </View>
              <View style={styles.articleAIContent}>
                <Text style={styles.articleAIText}>
                  React Native is a popular open-source framework for building mobile applications using JavaScript and React. It allows developers to create native mobile apps for both iOS and Android platforms using a single codebase.
                </Text>
                <Text style={styles.articleAIText}>
                  Key features include:
                </Text>
                <Text style={styles.articleAIText}>
                  • Cross-platform development with native performance
                </Text>
                <Text style={styles.articleAIText}>
                  • Hot reloading for faster development cycles
                </Text>
                <Text style={styles.articleAIText}>
                  • Large ecosystem of libraries and components
                </Text>
                <Text style={styles.articleAIText}>
                  • Strong community support and regular updates
                </Text>
                <TouchableOpacity style={styles.articleRegenerateButton}>
                  <Text style={styles.articleRegenerateIcon}>↻</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Another User Message */}
            <View style={styles.articleUserMessage}>
              <Text style={styles.articleUserMessageText}>How does it compare to Flutter?</Text>
            </View>

            {/* Another AI Response */}
            <View style={styles.articleAIResponseContainer}>
              <View style={styles.articleAIAvatar}>
                <Text style={styles.articleAIAvatarText}>AI</Text>
              </View>
              <View style={styles.articleAIContent}>
                <Text style={styles.articleAIText}>
                  React Native and Flutter are both excellent cross-platform frameworks, but they have different approaches and trade-offs.
                </Text>
                <Text style={styles.articleAIText}>
                  React Native uses JavaScript/TypeScript and bridges to native components, while Flutter uses Dart and renders everything through its own engine. React Native has a larger ecosystem and community, while Flutter offers more consistent performance and UI.
                </Text>
                <TouchableOpacity style={styles.articleRegenerateButton}>
                  <Text style={styles.articleRegenerateIcon}>↻</Text>
                </TouchableOpacity>
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