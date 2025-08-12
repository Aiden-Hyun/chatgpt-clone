import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
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
                fontFamily: theme.fontFamily.primary,
                fontSize: theme.fontSizes.md,
                lineHeight: 22,
                paddingVertical: 4,
                backgroundColor: 'transparent',
                borderWidth: 0,
                outlineStyle: 'none' as any,
              }}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => { console.log('[EDIT] send', draft); onSendEdited?.(draft); setIsEditing(false); }}
                style={[styles.actionButton, { borderColor: '#FFFFFF' }]}
                accessibilityRole="button"
              >
                <Text style={{ color: '#FFFFFF' }}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setDraft(message.content); setIsEditing(false); }}
                style={[styles.actionButton, { borderColor: theme.colors.text.secondary }]}
                accessibilityRole="button"
              >
                <Text style={{ color: theme.colors.text.secondary }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.bubble, !isLastInGroup && styles.bubbleCompact]}>
              <Text style={styles.text}>{message.content}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 6, gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    if (typeof navigator !== 'undefined' && navigator.clipboard && message.content) {
                      navigator.clipboard.writeText(message.content);
                    }
                  } catch {}
                  console.log('[USER-MSG] copy');
                }}
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="content-copy" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { console.log('[USER-MSG] edit'); setIsEditing(true); setDraft(message.content); }}
                style={{ padding: 4 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="edit" size={18} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
 
