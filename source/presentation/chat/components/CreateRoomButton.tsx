import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { useChatRoomViewModel } from '../../../business/chat/view-models/useChatRoomViewModel';
import { ChatRoom } from '../../../business/chat/entities/ChatRoom';

export interface CreateRoomButtonProps {
  onRoomCreated?: (room: ChatRoom) => void;
  style?: any;
}

export function CreateRoomButton({ onRoomCreated, style }: CreateRoomButtonProps) {
  const { createRoom, creatingRoom } = useChatRoomViewModel();
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest and fastest GPT-4' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast responses' },
  ];

  const handleCreateRoom = async () => {
    if (creatingRoom) return;

    const result = await createRoom(selectedModel, roomName.trim() || undefined);
    
    if (result.success && result.room) {
      setShowModal(false);
      setRoomName('');
      setSelectedModel('gpt-3.5-turbo');
      onRoomCreated?.(result.room);
    } else {
      Alert.alert('Error', result.error || 'Failed to create room');
    }
  };

  const handleQuickCreate = async () => {
    if (creatingRoom) return;

    const result = await createRoom('gpt-3.5-turbo');
    
    if (result.success && result.room) {
      onRoomCreated?.(result.room);
    } else {
      Alert.alert('Error', result.error || 'Failed to create room');
    }
  };

  const handleLongPress = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleQuickCreate}
        onLongPress={handleLongPress}
        disabled={creatingRoom}
      >
        <Text style={styles.buttonText}>
          {creatingRoom ? 'Creating...' : '+ New Chat'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Room</Text>
            
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Room Name (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={roomName}
                onChangeText={setRoomName}
                placeholder="Enter room name..."
                maxLength={100}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>AI Model</Text>
              {models.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelOption,
                    selectedModel === model.id && styles.selectedModelOption
                  ]}
                  onPress={() => setSelectedModel(model.id)}
                >
                  <View style={styles.modelInfo}>
                    <Text style={[
                      styles.modelName,
                      selectedModel === model.id && styles.selectedModelText
                    ]}>
                      {model.name}
                    </Text>
                    <Text style={[
                      styles.modelDescription,
                      selectedModel === model.id && styles.selectedModelText
                    ]}>
                      {model.description}
                    </Text>
                  </View>
                  {selectedModel === model.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateRoom}
                disabled={creatingRoom}
              >
                <Text style={styles.createButtonText}>
                  {creatingRoom ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedModelOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedModelText: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
