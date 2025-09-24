import { StyleSheet } from "react-native";

import { PresentationTheme } from "../../../interfaces/theme";

/**
 * ChatHeader Styles
 * Dedicated style file for ChatHeader component
 */
export const createChatHeaderStyles = (theme: PresentationTheme) => {
  return StyleSheet.create({
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.layout.buttonSizes.header + 34, // header button size + status bar
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.background.primary,
      borderBottomWidth: 0.001, // Borderless header
    },
    backButton: {
      minWidth: theme.layout.buttonSizes.header,
      minHeight: theme.layout.buttonSizes.header,
      borderRadius: theme.layout.buttonSizes.header / 2,
      backgroundColor: "transparent", // Transparent background for cleaner look
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
      borderWidth: 0, // Borderless
      padding: 0, // Override Button's default padding
    },
    backButtonText: {
      fontSize: theme.typography.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.semibold as "600",
      textAlign: "center",
      lineHeight: 24,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: theme.typography.fontSizes.lg,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.semibold as "600",
    },
    menuButton: {
      minWidth: theme.layout.buttonSizes.header,
      minHeight: theme.layout.buttonSizes.header,
      borderRadius: theme.layout.buttonSizes.header / 2,
      backgroundColor: "transparent", // Transparent background for cleaner look
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0, // Borderless
      padding: 0, // Override Button's default padding
    },
    menuButtonText: {
      fontSize: theme.typography.fontSizes.xl,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
      textAlign: "center",
      lineHeight: 24,
    },
    modelSelector: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm, // Reduced padding for more compact look
      backgroundColor: "transparent", // Transparent background
      borderRadius: theme.borders.radius.lg,
      borderWidth: 0, // Borderless model selector
      // Removed shadow for cleaner look
    },
    modelSelectorText: {
      fontSize: theme.typography.fontSizes.md,
      fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
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

      borderRadius: theme.borders.radius.md,
      padding: theme.spacing.sm,
      minWidth: 320, // Increased width to accommodate capability icons
      maxWidth: 400,

      ...theme.shadows.medium,
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
      borderRadius: theme.borders.radius.sm,
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
      marginRight: theme.spacing.lg,
      width: 20,
      alignItems: "center",
    },
    modelInfo: {
      flex: 1,
    },
    modelMenuText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
      fontFamily: theme.typography.fontFamily.primary,
    },
    selectedModelMenuText: {
      color: theme.colors.status.info.primary,
      fontWeight: theme.typography.fontWeights.semibold as "600",
    },
    modelDescription: {
      fontSize: 11,
      color: theme.colors.text.tertiary,
      fontFamily: theme.typography.fontFamily.primary,
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
      borderRadius: theme.borders.radius.md,
      padding: theme.spacing.sm,
      minWidth: 180,
      ...theme.shadows.medium,
    },
    quickActionsMenuItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borders.radius.sm,
      marginVertical: 2,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    quickActionsMenuText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeights.medium as "500",
      fontFamily: theme.typography.fontFamily.primary,
    },
    quickActionsItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    quickActionsIcon: {
      marginRight: theme.spacing.sm,
    },
  });
};
