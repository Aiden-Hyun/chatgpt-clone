import { StyleSheet } from 'react-native';

export const createLoadingMessageStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.primary,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.normal as '400',
    marginBottom: theme.spacing.md,
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
}); 