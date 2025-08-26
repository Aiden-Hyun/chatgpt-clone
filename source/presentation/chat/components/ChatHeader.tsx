import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatHeaderProps {
  roomName: string;
  messageCount: number;
  isLoading: boolean;
}

export function ChatHeader({ roomName, messageCount, isLoading }: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{roomName}</Text>
          {isLoading && (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
          <Text style={styles.messageCount}>
            {messageCount} message{messageCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: 44, // Status bar height
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
});
