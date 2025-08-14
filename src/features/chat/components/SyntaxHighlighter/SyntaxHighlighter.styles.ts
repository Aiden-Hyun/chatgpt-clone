import { StyleSheet } from 'react-native';

export const createSyntaxHighlighterStyles = (theme: any) => {
  return StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
    },
  });
};
