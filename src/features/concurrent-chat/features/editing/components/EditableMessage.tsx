import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { useMessageEditing } from '../useMessageEditing';

interface EditableMessageProps {
  messageId: string;
  originalContent: string;
  role: 'user' | 'assistant';
  eventBus: EventBus;
  serviceContainer: ServiceContainer;
  onEditStart?: () => void;
  onEditComplete?: (newContent: string) => void;
  onEditCancel?: () => void;
  onEditError?: (error: string) => void;
  style?: any;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
}

/**
 * EditableMessage - Component for editing message content
 * 
 * Features:
 * - Edit message content inline
 * - Real-time validation and feedback
 * - Save and cancel functionality
 * - Character count and limits
 * - Integration with editing service
 * - Event-driven editing process
 */
export const EditableMessage: React.FC<EditableMessageProps> = ({
  messageId,
  originalContent,
  role,
  eventBus,
  serviceContainer,
  onEditStart,
  onEditComplete,
  onEditCancel,
  onEditError,
  style,
  disabled = false,
  maxLength = 1000,
  placeholder = 'Edit your message...',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(originalContent);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    isInitialized,
    isLoading,
    error: editingError,
    editMessage,
    canEdit,
    getEditHistory,
    clearEditHistory,
    validateEdit,
  } = useMessageEditing(eventBus, serviceContainer);

  // Handle edit mode toggle
  const handleEditToggle = useCallback(() => {
    if (!isInitialized || isLoading || disabled || !canEdit(messageId)) {
      return;
    }

    if (isEditing) {
      // Cancel editing
      setEditContent(originalContent);
      setHasChanges(false);
      setIsEditing(false);
      onEditCancel?.();
    } else {
      // Start editing
      setIsEditing(true);
      setEditContent(originalContent);
      setHasChanges(false);
      onEditStart?.();
    }
  }, [
    messageId,
    originalContent,
    isEditing,
    isInitialized,
    isLoading,
    disabled,
    canEdit,
    onEditStart,
    onEditCancel,
  ]);

  // Handle content change
  const handleContentChange = useCallback((text: string) => {
    setEditContent(text);
    setHasChanges(text !== originalContent);
  }, [originalContent]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isInitialized || isLoading || !hasChanges) {
      return;
    }

    try {
      // Validate the edit
      const validation = validateEdit(messageId, editContent);
      if (!validation.isValid) {
        onEditError?.(validation.error || 'Invalid edit');
        return;
      }

      // Save the edit
      const updatedContent = await editMessage(messageId, editContent);
      
      setIsEditing(false);
      setHasChanges(false);
      onEditComplete?.(updatedContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Edit failed';
      onEditError?.(errorMessage);
    }
  }, [
    messageId,
    editContent,
    hasChanges,
    isInitialized,
    isLoading,
    validateEdit,
    editMessage,
    onEditComplete,
    onEditError,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditContent(originalContent);
    setHasChanges(false);
    setIsEditing(false);
    onEditCancel?.();
  }, [originalContent, onEditCancel]);

  // Determine if edit button should be disabled
  const isEditDisabled = disabled || isLoading || !isInitialized || !canEdit(messageId);

  // Get character count
  const characterCount = editContent.length;
  const isOverLimit = characterCount > maxLength;

  // Render edit mode
  if (isEditing) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.textInput,
              isOverLimit && styles.textInputError,
            ]}
            value={editContent}
            onChangeText={handleContentChange}
            placeholder={placeholder}
            multiline
            maxLength={maxLength}
            autoFocus
            editable={!isLoading}
          />
          
          {/* Character count */}
          <View style={styles.characterCount}>
            <Text style={[
              styles.characterCountText,
              isOverLimit && styles.characterCountError,
            ]}>
              {characterCount}/{maxLength}
            </Text>
          </View>

          {/* Edit controls */}
          <View style={styles.editControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading || !hasChanges || isOverLimit}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? '💾 Saving...' : '💾 Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>
                ❌ Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error display */}
        {editingError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {editingError}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Render view mode
  return (
    <View style={[styles.container, style]}>
      <View style={styles.viewContainer}>
        <Text style={[
          styles.content,
          role === 'user' ? styles.userContent : styles.assistantContent,
        ]}>
          {originalContent}
        </Text>

        {/* Edit button */}
        {canEdit(messageId) && (
          <TouchableOpacity
            style={[styles.editButton, isEditDisabled && styles.disabledButton]}
            onPress={handleEditToggle}
            disabled={isEditDisabled}
          >
            <Text style={styles.editButtonText}>
              ✏️ Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug info disabled for cleaner UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  viewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userContent: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  assistantContent: {
    backgroundColor: '#F2F2F7',
    color: '#000000',
    alignSelf: 'flex-start',
    marginRight: '15%',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  disabledButton: {
    opacity: 0.5,
  },
  editButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  editContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 12,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
  },
  textInputError: {
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 4,
    padding: 4,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#666666',
  },
  characterCountError: {
    color: '#F44336',
  },
  editControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
  },
  debugContainer: {
    marginTop: 4,
    padding: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666666',
  },
}); 