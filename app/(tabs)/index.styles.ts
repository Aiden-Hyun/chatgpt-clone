import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows, fontFamily, fontWeights, letterSpacing } from '../../src/shared/lib/theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background.primary
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xxl
  },
  emptyStateText: {
    fontSize: fontSizes.xl,
    color: colors.text.tertiary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
    fontFamily: fontFamily.primary,
    fontStyle: 'italic',
    letterSpacing: letterSpacing.wide
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium as '500',
    color: colors.button.text,
    textAlign: 'center',
    paddingVertical: spacing.lg,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide
  },
  welcomeText: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold as '600',
    color: colors.text.primary,
    marginVertical: spacing.lg,
    textAlign: 'center',
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide
  },
  logoutText: {
    color: colors.button.text, 
    fontSize: fontSizes.md, 
    fontFamily: fontFamily.primary, 
    letterSpacing: letterSpacing.wide
  },

  newButton: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.button.primary,
    borderRadius: borderRadius.lg,
    ...shadows.medium
  },
  logoutButton: {
    alignSelf: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.button.primary,
    borderRadius: borderRadius.lg,
    ...shadows.medium
  }
});
