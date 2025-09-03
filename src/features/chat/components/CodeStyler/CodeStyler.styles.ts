import { Platform, StyleSheet } from "react-native";

import { AppTheme } from "../../../theme/theme.types";

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  web: "'Cascadia Mono', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  default: "monospace",
});
const codeFontNative = "CascadiaMono";

export const createCodeStylerStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      backgroundColor: "transparent",
      borderRadius: 0,
      overflow: "hidden",
      fontFamily: Platform.OS === "web" ? monoFont : codeFontNative,
    },
  });
};
