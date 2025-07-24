import { StyleSheet } from 'react-native';
import { colors, fontFamily, fontSizes, fontWeights, spacing } from '../src/shared/lib/theme';

export const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: spacing.xxl,
    backgroundColor: colors.background.primary
  },
  title: { 
    fontSize: fontSizes.xxl, 
    marginBottom: spacing.xl,
    fontFamily: fontFamily.primary,
    fontWeight: fontWeights.semibold as '600',
    color: colors.text.primary
  },
});
