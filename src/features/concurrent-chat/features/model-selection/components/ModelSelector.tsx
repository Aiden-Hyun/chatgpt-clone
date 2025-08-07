import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

interface ModelOption {
  label: string;
  value: string;
  description?: string;
}

interface ModelSelectorProps {
  currentModel: string;
  availableModels: ModelOption[];
  onModelChange: (model: string) => void;
}

/**
 * ModelSelector - Component for selecting AI models in concurrent chat
 * 
 * Features:
 * - Displays current selected model
 * - Shows dropdown of available models
 * - Handles model selection
 * - Shows model descriptions
 * - Responsive design
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  availableModels,
  onModelChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get current model display info
  const getCurrentModelInfo = () => {
    const model = availableModels.find(m => m.value === currentModel);
    return model || { label: currentModel, value: currentModel };
  };

  const currentModelInfo = getCurrentModelInfo();

  // Handle model selection
  const handleModelSelect = (model: ModelOption) => {
    onModelChange(model.value);
    setIsModalVisible(false);
  };

  // Render individual model option
  const renderModelOption = ({ item }: { item: ModelOption }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: item.value === currentModel ? '#f0f8ff' : '#ffffff',
      }}
      onPress={() => handleModelSelect(item)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: item.value === currentModel ? '600' : '400',
            color: '#333',
          }}>
            {item.label}
          </Text>
          
          {item.description && (
            <Text style={{
              fontSize: 12,
              color: '#666',
              marginTop: 4,
            }}>
              {item.description}
            </Text>
          )}
        </View>
        
        {item.value === currentModel && (
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#007AFF',
          }} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Model selector button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#dee2e6',
        }}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={{
          fontSize: 14,
          color: '#333',
          fontWeight: '500',
          marginRight: 8,
        }}>
          {currentModelInfo.label}
        </Text>
        
        <Text style={{
          fontSize: 12,
          color: '#666',
        }}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* Model selection modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            width: '80%',
            maxHeight: '70%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            {/* Modal header */}
            <View style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: '#e0e0e0',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#333',
              }}>
                Select Model
              </Text>
              
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={{
                  padding: 4,
                }}
              >
                <Text style={{
                  fontSize: 20,
                  color: '#666',
                  fontWeight: 'bold',
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Model list */}
            <FlatList
              data={availableModels}
              renderItem={renderModelOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            />

            {/* Modal footer */}
            <View style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#6c757d',
                  borderRadius: 6,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  color: '#ffffff',
                  fontWeight: '500',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}; 