import { AppTheme } from "@/features/theme"; // ← Use absolute path with @ alias
import { StyleSheet } from "react-native";

export const createSidebarStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.colors.light,
    },
    chatHistory: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
    },
    userProfile: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.borders.colors.light,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    userName: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.text.primary,
    },
    settingsButton: {
      marginLeft: theme.spacing.sm,
    },
    newChatButton: {
      width: "100%",
    },
    chatItem: {
      marginVertical: 2,
      borderRadius: theme.borders.radius.md,
    },
    chatItemDelete: {
      padding: theme.spacing.xs,
      borderRadius: theme.borders.radius.sm,
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    draftBadge: {
      backgroundColor: theme.colors.status.info.background,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borders.radius.sm,
    },
    testButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: "rgba(255, 107, 53, 0.1)",
      borderRadius: theme.borders.radius.md,
      borderWidth: 1,
      borderColor: "#FF6B35",
    },
    testButtonText: {
      marginLeft: theme.spacing.xs,
      fontSize: 12,
      fontWeight: "600",
      color: "#FF6B35",
    },
  });
};
