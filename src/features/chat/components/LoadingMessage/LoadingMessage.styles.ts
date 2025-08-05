import { StyleSheet } from 'react-native';

export const createLoadingMessageStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg, // Increased horizontal padding to match AI responses
  },
  loadingText: {
    fontSize: theme.fontSizes.md, // Smaller, less prominent font
    fontFamily: theme.fontFamily.primary,
    color: theme.colors.text.secondary, // More subtle color
    fontWeight: theme.fontWeights.normal as '400',
    marginBottom: theme.spacing.md,
    lineHeight: 24, // Tighter line height
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.tertiary,
    marginRight: theme.spacing.sm,
  },
}); 