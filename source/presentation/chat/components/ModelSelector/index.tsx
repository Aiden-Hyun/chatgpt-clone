import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../../../../layers/business/theme/context/ThemeContext';
import { useToast } from '../../../../../layers/presentation/alert/toast/ToastContext';
import { AVAILABLE_MODELS, ModelInfo, getModelInfo } from '../../../../business/chat/constants/models';
import { createModelSelectorStyles } from './ModelSelector.styles';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => Promise<void>;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  const { currentTheme } = useThemeContext();
  const styles = useMemo(() => createModelSelectorStyles(currentTheme), [currentTheme]);
  const { showError } = useToast();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);

  const selectedModelInfo = useMemo(() => {
    return getModelInfo(selectedModel);
  }, [selectedModel]);

  const handleModelSelect = async (model: ModelInfo) => {
    if (isChanging || model.value === selectedModel) {
      setIsModalVisible(false);
      return;
    }

    setIsChanging(true);
    try {
      await onModelChange(model.value);
      setIsModalVisible(false);
    } catch (error) {
      showError('Failed to change model');
    } finally {
      setIsChanging(false);
    }
  };

  const renderCapability = (capability: string, enabled: boolean) => {
    if (!enabled) return null;
    return (
      <View key={capability} style={styles.capability}>
        <Text style={styles.capabilityText}>{capability}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>
          {selectedModelInfo?.label || selectedModel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={currentTheme.colors.text.primary}
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Model</Text>
            <ScrollView style={styles.modelList}>
              {AVAILABLE_MODELS.map((model) => (
                <TouchableOpacity
                  key={model.value}
                  style={[
                    styles.modelItem,
                    model.value === selectedModel && styles.modelItemSelected,
                  ]}
                  onPress={() => handleModelSelect(model)}
                  disabled={isChanging}
                >
                  <Text style={styles.modelLabel}>{model.label}</Text>
                  <Text style={styles.modelDescription}>{model.description}</Text>
                  <Text style={styles.modelProvider}>{model.provider}</Text>
                  <View style={styles.capabilities}>
                    {renderCapability('Chat', model.capabilities.chat)}
                    {renderCapability('Code', model.capabilities.code)}
                    {renderCapability('Vision', model.capabilities.vision)}
                    {renderCapability('Search', model.capabilities.search)}
                    {renderCapability('Analysis', model.capabilities.analysis)}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
