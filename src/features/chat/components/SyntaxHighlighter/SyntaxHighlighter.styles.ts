import { Platform, StyleSheet } from 'react-native';

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  default: 'monospace',
});

export const createSyntaxHighlighterStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
      fontFamily: monoFont as any,
    },
  });
};
