import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';
import { createMessageInteractionBarStyles } from './MessageInteractionBar.styles';

interface MessageInteractionBarProps {
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onAudio?: () => void;
}

export const MessageInteractionBar: React.FC<MessageInteractionBarProps> = ({
  onRegenerate,
  onLike,
  onDislike,
  onShare,
  onCopy,
  onAudio,
}) => {
  const theme = useAppTheme();
  const styles = createMessageInteractionBarStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onRegenerate}>
          <Text style={styles.iconText}>💬</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onLike}>
          <Text style={styles.iconText}>👍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onDislike}>
          <Text style={styles.iconText}>👎</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onAudio}>
          <Text style={styles.iconText}>🔊</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onCopy}>
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onShare}>
          <Text style={styles.iconText}>📤</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>⌄</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.scrollIndicator}>
        <Text style={styles.scrollIcon}>⌄</Text>
      </View>
    </View>
  );
}; 