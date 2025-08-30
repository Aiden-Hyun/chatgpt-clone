import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/hooks/useTheme';

interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ loading, children }) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
  });

