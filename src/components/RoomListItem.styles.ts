import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows, fontFamily, fontWeights, letterSpacing } from '../theme';

export const styles = StyleSheet.create({
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.medium
  },
  room: {
    flex: 1,
    padding: spacing.xl,
  },
  roomName: { 
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular as '400',
    color: colors.text.primary,
    lineHeight: 26,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.normal
  },
  deleteButton: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium
  },
  deleteText: {
    fontSize: fontSizes.md,
    color: colors.text.inverted,
    fontWeight: fontWeights.medium as '500',
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide
  },
});
