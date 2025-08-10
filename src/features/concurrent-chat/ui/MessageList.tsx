import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { ConcurrentMessage } from '../core/types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: ConcurrentMessage[];
  onCancelMessage: (messageId: string) => void;
  onRetryMessage: (messageId: string) => void;
  onClearMessages: () => void;
}

/**
 * MessageList - Displays all concurrent messages with their states and actions
 * 
 * Features:
 * - Displays messages in chronological order
 * - Shows different states (pending, processing, completed, failed, cancelled)
 * - Provides action buttons for each message
 * - Handles empty state
 * - Supports concurrent message display
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onCancelMessage,
  onRetryMessage,
  onClearMessages,
}) => {
  // Render individual message item
  const renderMessage = ({ item, index }: { item: ConcurrentMessage; index: number }) => (
    <MessageItem
      message={item}
      index={index}
      onCancel={() => onCancelMessage(item.id)}
      onRetry={() => onRetryMessage(item.id)}
      isLastInGroup={index === messages.length - 1}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      minHeight: 200,
    }}>
      <Text style={{
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        No messages yet
      </Text>
      <Text style={{
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
      }}>
        Start a conversation by sending a message
      </Text>
    </View>
  );

  // Render header with clear button if there are messages
  const renderHeader = () => {
    if (messages.length === 0) return null;

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
      }}>
        <Text style={{
          fontSize: 14,
          color: '#666',
          fontWeight: '500',
        }}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </Text>
        
        <TouchableOpacity
          onPress={onClearMessages}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: '#dc3545',
            borderRadius: 6,
          }}
        >
          <Text style={{
            fontSize: 12,
            color: 'white',
            fontWeight: '500',
          }}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Get message status summary
  const getStatusSummary = () => {
    const statusCounts = messages.reduce((acc, message) => {
      acc[message.status] = (acc[message.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pending: statusCounts.pending || 0,
      processing: statusCounts.processing || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0,
      cancelled: statusCounts.cancelled || 0,
    };
  };

  const statusSummary = getStatusSummary();

  return (
    <View style={{ flex: 1 }}>
      {/* Status summary bar */}
      {messages.length > 0 && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 8,
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        }}>
          {statusSummary.pending > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#ffc107', fontWeight: '500' }}>
                {statusSummary.pending}
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Pending</Text>
            </View>
          )}
          
          {statusSummary.processing > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#007bff', fontWeight: '500' }}>
                {statusSummary.processing}
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Processing</Text>
            </View>
          )}
          
          {statusSummary.completed > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#28a745', fontWeight: '500' }}>
                {statusSummary.completed}
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Completed</Text>
            </View>
          )}
          
          {statusSummary.failed > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#dc3545', fontWeight: '500' }}>
                {statusSummary.failed}
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Failed</Text>
            </View>
          )}
          
          {statusSummary.cancelled > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#6c757d', fontWeight: '500' }}>
                {statusSummary.cancelled}
              </Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Cancelled</Text>
            </View>
          )}
        </View>
      )}

      {/* Messages list */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 16,
        }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 8 }} />
        )}
      />
    </View>
  );
}; 