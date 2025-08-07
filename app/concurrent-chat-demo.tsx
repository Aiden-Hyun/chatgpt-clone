import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConcurrentChat } from '../src/features/concurrent-chat';

/**
 * Concurrent Chat Demo Page
 * 
 * This page demonstrates the concurrent chat functionality with:
 * - Multiple message sending without blocking
 * - Real-time status updates
 * - Model selection
 * - Plugin system integration
 * - Command pattern with undo/redo
 * - SOLID architecture implementation
 */
export default function ConcurrentChatDemo() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Concurrent Chat Demo</Text>
        <Text style={styles.subtitle}>
          SOLID Architecture • Plugin System • Command Pattern
        </Text>
      </View>
      
      <ConcurrentChat 
        roomId={1}
        initialModel="gpt-3.5-turbo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
}); 