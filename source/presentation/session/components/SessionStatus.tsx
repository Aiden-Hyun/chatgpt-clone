import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSessionStatus } from '../hooks/useSessionStatus';

export function SessionStatus() {
  const { session, isLoading, error, refreshSession } = useSessionStatus();
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>No active session</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[
          styles.statusValue,
          session.isActive() ? styles.activeStatus : styles.expiredStatus
        ]}>
          {session.isActive() ? 'Active' : 'Expired'}
        </Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{session.userId}</Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>Expires:</Text>
        <Text style={styles.value}>
          {session.expiresAt.toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.label}>Last Activity:</Text>
        <Text style={styles.value}>
          {session.lastActivity.toLocaleString()}
        </Text>
      </View>
      
      {session.isExpiringSoon() && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Session expires soon
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
  statusText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  value: {
    color: '#666',
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatus: {
    color: '#28a745',
  },
  expiredStatus: {
    color: '#dc3545',
  },
  warningContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
  },
});
