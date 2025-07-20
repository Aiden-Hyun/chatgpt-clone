import { StyleSheet } from 'react-native';
import { borderRadius, colors, fontFamily, fontSizes, fontWeights, letterSpacing, shadows, spacing } from '../../src/shared/lib/theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background.primary 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.background.primary
  },
  header: { 
    padding: spacing.lg, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.light,
  },
  logout: { 
    alignItems: 'flex-end',
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelLabel: {
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
    fontFamily: fontFamily.primary,
  },
  picker: {
    width: 150,
    height: 30,
  },
  pickerItem: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamily.primary,
  },
  messageBubble: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    maxWidth: '85%',
    ...shadows.medium,
  },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'flex-end',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    ...shadows.medium,
  },
  input: {
    flex: 1,
    borderColor: colors.border.medium,
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    fontSize: fontSizes.md,
    backgroundColor: colors.background.primary,
    maxHeight: 120,
    minHeight: 44,
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.normal
  },
  messagesList: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    flexGrow: 1,
  },
  sendButton: {
    backgroundColor: colors.button.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.medium,
  },
  sendButtonText: {
    color: colors.button.text,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as '500',
    fontFamily: fontFamily.primary,
    letterSpacing: letterSpacing.wide
  },
  disabledButton: {
    opacity: 0.6
  }
});
