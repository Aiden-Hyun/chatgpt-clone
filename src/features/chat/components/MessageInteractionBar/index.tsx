import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useToast } from '../../../alert';
import { useAppTheme } from '../../../theme/theme';
import { createMessageInteractionBarStyles } from './MessageInteractionBar.styles';

interface MessageInteractionBarProps {
  onRegenerate?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onAudio?: () => void;
  // Like/dislike state
  isLiked?: boolean;
  isDisliked?: boolean;
}

export const MessageInteractionBar: React.FC<MessageInteractionBarProps> = ({
  onRegenerate,
  onLike,
  onDislike,
  onShare,
  onCopy,
  onAudio,
  isLiked = false,
  isDisliked = false,
}) => {
  const theme = useAppTheme();
  const styles = createMessageInteractionBarStyles(theme);
  const { showSuccess } = useToast();
  const handleRegeneratePress = () => {
    
    onRegenerate?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<MaterialIcons name="refresh" size={20} color={theme.colors.text.secondary} />}
          onPress={handleRegeneratePress}
          containerStyle={styles.iconButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <MaterialIcons 
              name="thumb-up" 
              size={20} 
              color={isLiked ? theme.colors.primary : theme.colors.text.secondary} 
            />
          }
          onPress={onLike}
          containerStyle={styles.iconButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={
            <MaterialIcons 
              name="thumb-down" 
              size={20} 
              color={isDisliked ? theme.colors.status.error.primary : theme.colors.text.secondary} 
            />
          }
          onPress={onDislike}
          containerStyle={styles.iconButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<MaterialIcons name="volume-up" size={20} color={theme.colors.text.secondary} />}
          onPress={onAudio}
          containerStyle={styles.iconButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<MaterialIcons name="content-copy" size={20} color={theme.colors.text.secondary} />}
          onPress={() => {
            onCopy?.();
          }}
          containerStyle={styles.iconButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<MaterialIcons name="share" size={20} color={theme.colors.text.secondary} />}
          onPress={async () => {
            try { await onShare?.(); } catch {}
          }}
          containerStyle={styles.iconButton}
        />
      </View>
    </View>
  );
}; 