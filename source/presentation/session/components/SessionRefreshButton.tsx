import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

import { useSessionRefresh } from '../hooks/useSessionRefresh';

export function SessionRefreshButton() {
  const { refreshSession, isLoading, lastRefreshTime } = useSessionRefresh();

  const handleRefresh = () => {
    refreshSession();
  };

  return (
    <View style={styles.container}>
      <Button
        title={isLoading ? "Refreshing..." : "Refresh Session"}
        onPress={handleRefresh}
        disabled={isLoading}
        color="#007AFF"
      />
      
      {lastRefreshTime && (
        <Text style={styles.lastRefreshText}>
          Last refreshed: {lastRefreshTime.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  lastRefreshText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});
