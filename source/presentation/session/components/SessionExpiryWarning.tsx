import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

import { useSessionExpiry } from '../hooks/useSessionExpiry';

export function SessionExpiryWarning() {
  const { 
    isExpiringSoon, 
    timeRemaining, 
    refreshSession, 
    isLoading 
  } = useSessionExpiry();

  if (!isExpiringSoon) {
    return null;
  }

  const handleRefresh = () => {
    Alert.alert(
      'Refresh Session',
      'Do you want to refresh your session to stay logged in?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Refresh',
          onPress: refreshSession,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.warningContent}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.warningTitle}>Session Expires Soon</Text>
          <Text style={styles.warningMessage}>
            Your session will expire in {timeRemaining}. 
            Refresh to stay logged in.
          </Text>
        </View>
      </View>
      
      <Button
        title={isLoading ? "Refreshing..." : "Refresh Session"}
        onPress={handleRefresh}
        disabled={isLoading}
        color="#007AFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
