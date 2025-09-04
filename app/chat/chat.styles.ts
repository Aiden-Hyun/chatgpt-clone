import { StyleSheet } from "react-native";

import { AppTheme } from "@/features/theme";

export const createChatStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    // Add any other chat-specific styles here
  });
};

export default createChatStyles;
