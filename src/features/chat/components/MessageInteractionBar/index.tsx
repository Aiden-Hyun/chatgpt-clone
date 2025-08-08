import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
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
  const handleRegeneratePress = () => {
    console.log('[REGENERATE] Click');
    onRegenerate?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleRegeneratePress}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onLike}>
          <MaterialIcons name="thumb-up" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onDislike}>
          <MaterialIcons name="thumb-down" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onAudio}>
          <MaterialIcons name="volume-up" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onCopy}>
          <MaterialIcons name="content-copy" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={onShare}>
          <MaterialIcons name="share" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 