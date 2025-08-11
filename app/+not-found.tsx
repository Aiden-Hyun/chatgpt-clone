import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../src/features/theme/lib/theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: theme.colors.background.primary,
    },
    title: {
      fontSize: theme.fontSizes.xxl,
      fontWeight: theme.fontWeights.bold as '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
    linkText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.status.info.primary,
      textDecorationLine: 'underline',
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
