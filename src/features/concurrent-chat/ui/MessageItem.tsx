import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ConcurrentMessage } from '../core/types/interfaces/IMessageProcessor';

interface MessageItemProps {
  message: ConcurrentMessage;
  index: number;
  onCancel: () => void;
  onRetry: () => void;
  isLastInGroup?: boolean;
}

/**
 * MessageItem - Displays individual concurrent messages with states and actions
 * 
 * Features:
 * - Shows message content based on role (user/assistant)
 * - Displays different states with appropriate indicators
 * - Provides action buttons (cancel, retry) based on state
 * - Shows timestamps and metadata
 * - Handles error states with error messages
 * - Supports concurrent message display
 */
export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  onCancel,
  onRetry,
  isLastInGroup = true,
}) => {
  // Get status-specific styling and content
  const getStatusInfo = () => {
    switch (message.status) {
      case 'pending':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          statusText: 'Pending',
          statusColor: '#856404',
          showActions: true,
          showCancel: true,
          showRetry: false,
        };
      
      case 'processing':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          statusText: 'Processing',
          statusColor: '#0c5460',
          showActions: true,
          showCancel: true,
          showRetry: false,
        };
      
      case 'completed':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          statusText: 'Completed',
          statusColor: '#155724',
          showActions: false,
          showCancel: false,
          showRetry: false,
        };
      
      case 'failed':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          statusText: 'Failed',
          statusColor: '#721c24',
          showActions: true,
          showCancel: false,
          showRetry: true,
        };
      
      case 'cancelled':
        return {
          backgroundColor: '#e2e3e5',
          borderColor: '#d6d8db',
          statusText: 'Cancelled',
          statusColor: '#383d41',
          showActions: true,
          showCancel: false,
          showRetry: true,
        };
      
      default:
        return {
          backgroundColor: '#ffffff',
          borderColor: '#dee2e6',
          statusText: 'Unknown',
          statusColor: '#6c757d',
          showActions: false,
          showCancel: false,
          showRetry: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get role-specific styling
  const getRoleInfo = () => {
    if (message.role === 'user') {
      return {
        alignSelf: 'flex-end' as const,
        backgroundColor: '#007AFF',
        textColor: '#ffffff',
        maxWidth: '80%',
      };
    } else {
      return {
        alignSelf: 'flex-start' as const,
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        maxWidth: '80%',
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <View style={{
      marginHorizontal: 16,
      marginVertical: 4,
      alignSelf: roleInfo.alignSelf,
      maxWidth: roleInfo.maxWidth,
    }}>
      {/* Message container */}
      <View style={{
        backgroundColor: statusInfo.backgroundColor,
        borderWidth: 1,
        borderColor: statusInfo.borderColor,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
        {/* Message header with status and timestamp */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: statusInfo.statusColor,
              textTransform: 'uppercase',
            }}>
              {statusInfo.statusText}
            </Text>
            
            {message.status === 'processing' && (
              <ActivityIndicator
                size="small"
                color={statusInfo.statusColor}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          
          <Text style={{
            fontSize: 11,
            color: '#666',
          }}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>

        {/* Message content */}
        <View style={{
          backgroundColor: roleInfo.backgroundColor,
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}>
          <Text style={{
            fontSize: 14,
            color: roleInfo.textColor,
            lineHeight: 20,
          }}>
            {message.content || 'No content'}
          </Text>
        </View>

        {/* Error message */}
        {message.error && (
          <View style={{
            backgroundColor: '#f8d7da',
            borderWidth: 1,
            borderColor: '#f5c6cb',
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 12,
              color: '#721c24',
              fontStyle: 'italic',
            }}>
              Error: {message.error}
            </Text>
          </View>
        )}

        {/* Metadata */}
        {(message.model || message.roomId) && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            {message.model && (
              <Text style={{
                fontSize: 10,
                color: '#666',
                fontStyle: 'italic',
              }}>
                Model: {message.model}
              </Text>
            )}
            
            {message.roomId && (
              <Text style={{
                fontSize: 10,
                color: '#666',
                fontStyle: 'italic',
              }}>
                Room: {message.roomId}
              </Text>
            )}
          </View>
        )}

        {/* Action buttons */}
        {statusInfo.showActions && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 8,
          }}>
            {statusInfo.showCancel && (
              <TouchableOpacity
                onPress={onCancel}
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
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
            
            {statusInfo.showRetry && (
              <TouchableOpacity
                onPress={onRetry}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#007AFF',
                  borderRadius: 6,
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: 'white',
                  fontWeight: '500',
                }}>
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Message ID for debugging */}
        {__DEV__ && (
          <Text style={{
            fontSize: 8,
            color: '#999',
            marginTop: 4,
            fontFamily: 'monospace',
          }}>
            ID: {message.id}
          </Text>
        )}
      </View>
    </View>
  );
}; 