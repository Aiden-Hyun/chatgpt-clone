import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createChatHeaderStyles } from './ChatHeader.styles';

interface ChatHeaderProps {
  selectedModel: string;
  updateModel: (model: string) => void;
  onLogout: () => void;
}

/**
 * ChatHeader
 * Renders the top bar of the chat screen containing the model picker and a logout button.
 * Extracted from app/(tabs)/chat.tsx for improved modularity.
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  updateModel,
  onLogout,
}) => {
  // Get styles from dedicated style file
  const styles = createChatHeaderStyles();

  return (
    <View style={styles.header}>
      <View style={styles.modelSelector}>
        <Text style={styles.modelLabel}>Model:</Text>
        <Picker
          selectedValue={selectedModel}
          onValueChange={(value: string) => updateModel(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
          <Picker.Item label="GPT-3.5 Turbo-16k" value="gpt-3.5-turbo-16k" />
          <Picker.Item label="GPT-4" value="gpt-4" />
          <Picker.Item label="GPT-4 Turbo" value="gpt-4-turbo" />
          <Picker.Item label="GPT-4o" value="gpt-4o" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader; 