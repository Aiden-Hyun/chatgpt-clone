import { StyleSheet } from 'react-native';

export const createLoadingMessageStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  avatar: {
    fontSize: theme.fontSizes.md,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.primary,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.medium as '500',
    marginBottom: theme.spacing.sm,
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
}); 