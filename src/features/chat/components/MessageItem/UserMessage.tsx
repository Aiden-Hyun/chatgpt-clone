import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { copy as copyToClipboard } from '../../../../shared/lib/clipboard';
import { useToast } from '../../../alert';
import { useAppTheme } from '../../../theme/theme';
import { ChatMessage } from '../../types';
import { createUserMessageStyles } from './UserMessage.styles';

interface UserMessageProps {
  message: ChatMessage;
  isLastInGroup?: boolean;
  onSendEdited?: (newText: string) => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  isLastInGroup = true,
  onSendEdited,
}) => {
  const theme = useAppTheme();
  const styles = createUserMessageStyles(theme);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const { showSuccess, showError } = useToast();

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <View style={{ alignItems: 'flex-end' }}>
        {isEditing ? (
          <View style={styles.bubbleEdit}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              multiline
              style={{
                color: theme.colors.message.userText,
                                  fontFamily: theme.typography.fontFamily.primary,
                fontSize: theme.typography.fontSizes.md,
                lineHeight: 22,
                paddingVertical: 4,
                backgroundColor: 'transparent',
                borderWidth: 0,
                outlineStyle: 'none' as any,
              }}
            />
            <View style={styles.actionRow}>
              <Button
                label="Send"
                variant="primary"
                size="sm"
                onPress={() => { console.log('[EDIT] send', draft); onSendEdited?.(draft); setIsEditing(false); }}
                containerStyle={styles.actionButton}
              />
              <Button
                label="Cancel"
                variant="primary"
                size="sm"
                onPress={() => { setDraft(message.content); setIsEditing(false); }}
                containerStyle={styles.actionButton}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.bubble, !isLastInGroup && styles.bubbleCompact]}>
              <Text style={styles.text}>{message.content}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 6, gap: 12 }}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Ionicons name="copy-outline" size={18} color={theme.colors.text.secondary} />}
                onPress={async () => {
                  try {
                    await copyToClipboard(message.content);
                    try { showSuccess('Copied to clipboard'); } catch {}
                  } catch {
                    try { showError('Failed to copy'); } catch {}
                  }
                  console.log('[USER-MSG] copy');
                }}
                containerStyle={{ padding: 4 }}
              />
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Ionicons name="create-outline" size={18} color={theme.colors.text.secondary} />}
                onPress={() => { console.log('[USER-MSG] edit'); setIsEditing(true); setDraft(message.content); }}
                containerStyle={{ padding: 4 }}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
};
 
