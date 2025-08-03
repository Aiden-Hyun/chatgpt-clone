import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '../lib/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'link' | 'button';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  weight = 'regular',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  
  // Use provided colors or fall back to theme colors
  const color = lightColor || darkColor || theme.colors.text.primary;

  return (
    <Text
      style={[
        { 
          color,
          fontFamily: theme.fontFamily.primary,
          fontWeight: theme.fontWeights[weight],
          letterSpacing: theme.letterSpacing.normal,
        },
        type === 'default' ? styles.default(theme) : undefined,
        type === 'title' ? styles.title(theme) : undefined,
        type === 'subtitle' ? styles.subtitle(theme) : undefined,
        type === 'caption' ? styles.caption(theme) : undefined,
        type === 'link' ? styles.link(theme) : undefined,
        type === 'button' ? styles.button(theme) : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = {
  default: (theme: any) => StyleSheet.create({
    default: {
      fontSize: theme.fontSizes.md,
      lineHeight: theme.fontSizes.md * 1.5,
    },
  }).default,
  
  title: (theme: any) => StyleSheet.create({
    title: {
      fontSize: theme.fontSizes.xxl,
      lineHeight: theme.fontSizes.xxl * 1.2,
      fontWeight: theme.fontWeights.bold,
    },
  }).title,
  
  subtitle: (theme: any) => StyleSheet.create({
    subtitle: {
      fontSize: theme.fontSizes.xl,
      lineHeight: theme.fontSizes.xl * 1.3,
      fontWeight: theme.fontWeights.semibold,
    },
  }).subtitle,
  
  caption: (theme: any) => StyleSheet.create({
    caption: {
      fontSize: theme.fontSizes.sm,
      lineHeight: theme.fontSizes.sm * 1.4,
      color: theme.colors.text.tertiary,
    },
  }).caption,
  
  link: (theme: any) => StyleSheet.create({
    link: {
      fontSize: theme.fontSizes.md,
      lineHeight: theme.fontSizes.md * 1.5,
      color: theme.colors.status.info.primary,
      textDecorationLine: 'underline',
    },
  }).link,
  
  button: (theme: any) => StyleSheet.create({
    button: {
      fontSize: theme.fontSizes.md,
      lineHeight: theme.fontSizes.md * 1.2,
      fontWeight: theme.fontWeights.medium,
      textAlign: 'center',
    },
  }).button,
};
