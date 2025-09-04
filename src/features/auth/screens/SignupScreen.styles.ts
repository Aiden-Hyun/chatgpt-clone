import { StyleSheet } from "react-native";

import { AppTheme } from "@/features/theme";

export const createSignupStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    title: {
      marginBottom: theme.spacing.lg,
    },
    button: {
      marginTop: theme.spacing.md,
    },
    linkButton: {
      marginTop: theme.spacing.md,
    },
  });
};

export default createSignupStyles;
