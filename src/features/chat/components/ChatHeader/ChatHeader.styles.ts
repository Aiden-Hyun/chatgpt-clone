import { Platform, StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/theme.types";

/**
 * ChatHeader Styles
 * Dedicated style file for ChatHeader component
 */
export const createChatHeaderStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.lg + 40, // Add extra padding for iOS status bar
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 0, // Borderless header
      ...theme.shadows.light,
    },
    backButton: {
      minWidth: 44,
      minHeight: 44,
      borderRadius: 22,
      backgroundColor: "transparent", // Transparent background for cleaner look
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
      borderWidth: 0, // Borderless
      padding: 0, // Override Button's default padding
    },
    backButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as "600",
      textAlign: "center",
      lineHeight: 24,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: theme.fontSizes.lg,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.semibold as "600",
    },
    menuButton: {
      minWidth: 44,
      minHeight: 44,
      borderRadius: 22,
      backgroundColor: "transparent", // Transparent background for cleaner look
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0, // Borderless
      padding: 0, // Override Button's default padding
    },
    menuButtonText: {
      fontSize: theme.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as "500",
      textAlign: "center",
      lineHeight: 24,
    },
    modelSelector: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm, // Reduced padding for more compact look
      backgroundColor: "transparent", // Transparent background
      borderRadius: theme.borderRadius.lg,
      borderWidth: 0, // Borderless model selector
      // Removed shadow for cleaner look
    },
    modelSelectorText: {
      fontSize: theme.fontSizes.md,
      fontFamily: theme.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as "500",
      marginRight: theme.spacing.xs,
    },
    modelMenuOverlay: {
      flex: 1,
      //backgroundColor: theme.colors.feedback.overlay.medium,
      backgroundColor: "transparent",

      justifyContent: "flex-start",
      alignItems: "center",
    },
    modelMenuContainer: {
      backgroundColor: theme.colors.background.primary,

      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: Platform.OS === "ios" ? 100 : 80,
      minWidth: 320, // Increased width to accommodate capability icons
      maxWidth: 400,

      ...theme.shadows.medium,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    modelListContainer: {
      maxHeight: 400, // Increased height for more models
    },
    modelMenuItemContainer: {
      marginBottom: 4,
    },
    modelMenuItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectedModelMenuItem: {
      backgroundColor: theme.colors.background.secondary,
    },
    modelItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    providerLogo: {
      marginRight: theme.spacing.sm,
      width: 20,
      alignItems: "center",
    },
    modelInfo: {
      flex: 1,
    },
    modelMenuText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as "500",
      fontFamily: theme.fontFamily.primary,
    },
    selectedModelMenuText: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.fontWeights.semibold as "600",
    },
    modelDescription: {
      fontSize: 11,
      color: theme.colors.text.secondary + "80",
      fontFamily: theme.fontFamily.primary,
      marginTop: 10,
      fontStyle: "italic",
    },
    modelItemRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    capabilityIcons: {
      marginRight: theme.spacing.xs,
    },
    checkIcon: {
      marginLeft: theme.spacing.xs,
    },
    quickActionsOverlay: {
      flex: 1,
      backgroundColor: "transparent",
      justifyContent: "flex-start",
      alignItems: "flex-end",
    },
    quickActionsContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: Platform.OS === "ios" ? 100 : 60,
      marginRight: 16,
      minWidth: 180,
      ...theme.shadows.medium,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    quickActionsMenuItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    quickActionsMenuText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.fontWeights.medium as "500",
      fontFamily: theme.fontFamily.primary,
    },
  });
};
