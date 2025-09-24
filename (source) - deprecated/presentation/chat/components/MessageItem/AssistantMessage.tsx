import React from 'react';
import { Text, View } from 'react-native';

import { useToast } from '../../../alert/toast';
import { IAssistantMessageProps } from '../../../interfaces/chat';
import { useBusinessContext } from '../../../shared/BusinessContextProvider';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { AssistantMessageBar } from '../AssistantMessageBar';

import { createAssistantMessageStyles } from './AssistantMessage.styles';

export const AssistantMessage: React.FC<IAssistantMessageProps> = React.memo(function AssistantMessage({
  message,
  onRegenerate,
}: IAssistantMessageProps) {
  const theme = useAppTheme();
  const { clipboard } = useBusinessContext();
  
  // Memoize styles to prevent re-creation on every render
  const styles = React.useMemo(() => createAssistantMessageStyles(theme), [theme]);
  const { showSuccess, showError } = useToast();
  const isAnimating = false; // Simplified for now
  const contentToShow = message.content || '';



  return (
    <View style={styles.container}>
      <Text>{contentToShow}</Text>

      {/* Message interaction bar - always show for assistant messages */}
      {!isAnimating && (
        <AssistantMessageBar
          onRegenerate={onRegenerate}
          onLike={() => {}}
          onDislike={() => {}}
          isLiked={false}
          isDisliked={false}
          onCopy={async () => {
            try {
              const result = await clipboard.copyToClipboard(message.content);
              if (result.success) {
                showSuccess('Copied to clipboard');
              } else {
                showError('Failed to copy');
              }
            } catch {
              showError('Failed to copy');
            }
          }}
        />
      )}
    </View>
  );
});