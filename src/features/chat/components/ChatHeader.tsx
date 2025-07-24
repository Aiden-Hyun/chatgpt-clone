import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import {
    colors,
    fontFamily,
    fontSizes,
    shadows,
    spacing,
} from '../../../shared/lib/theme';

interface ChatHeaderProps {
  selectedModel: string;
  updateModel: (model: string) => void;
  onLogout: () => Promise<void>;
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
}) => (
  <View style={styles.header}>
    <View style={styles.modelSelector}>
      <Text style={styles.modelLabel}>Model:</Text>
      <Picker
        selectedValue={selectedModel}
        onValueChange={(value) => updateModel(value)}
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
    <Button title="Logout" onPress={onLogout} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.light,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modelLabel: {
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
    fontFamily: fontFamily.primary,
  },
  picker: {
    width: 150,
    height: 30,
  },
  pickerItem: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamily.primary,
  },
});

export default ChatHeader;
