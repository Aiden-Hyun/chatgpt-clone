import { StyleSheet } from "react-native";

import { AppTheme } from "@/features/theme";

export const createDeleteAccountStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    contentContainer: {
      paddingBottom: theme.spacing.xxl,
      minHeight: "100%",
    },
    section: {
      marginTop: theme.spacing.xl,
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    headline: {
      textAlign: "center",
      marginBottom: theme.spacing.lg,
      color: theme.colors.text.primary,
    },
    bulletList: {
      gap: theme.spacing.md,
    },
    bulletItem: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    bulletIcon: {
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    bulletText: {
      flex: 1,
      color: theme.colors.text.secondary,
    },
    bulletTextHighlight: {
      flex: 1,
      color: theme.colors.status.success.primary,
    },
    inputSection: {
      marginBottom: theme.spacing.lg,
    },
    oauthCard: {
      marginBottom: theme.spacing.lg,
    },
    oauthNotice: {
      textAlign: "center",
      color: theme.colors.text.secondary,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.borders.radius.sm,
      borderWidth: 2,
      borderColor: theme.colors.text.tertiary,
      marginRight: theme.spacing.md,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: theme.colors.status.error.primary,
      borderColor: theme.colors.status.error.primary,
    },
    checkboxLabel: {
      flex: 1,
      color: theme.colors.text.secondary,
    },
    submitButton: {
      marginBottom: theme.spacing.md,
    },
    backButton: {
      marginBottom: theme.spacing.lg,
    },
    // Pending deletion styles
    pendingHeadline: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.status.warning.primary,
    },
    pendingDescription: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
      color: theme.colors.text.secondary,
    },
    cancelHint: {
      textAlign: "center",
      color: theme.colors.status.success.primary,
      fontStyle: "italic",
    },
    cancelButton: {
      marginBottom: theme.spacing.md,
    },
  });
};

export default createDeleteAccountStyles;

