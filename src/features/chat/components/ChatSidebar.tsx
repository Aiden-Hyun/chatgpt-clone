import { Button, ListItem, Text } from '@/components';
import { useToast } from '@/features/alert';
import { useUserInfo } from '@/features/auth';
import { useChatRooms } from '@/features/chat/hooks';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import mobileStorage from '../../../shared/lib/mobileStorage';
import { SIDEBAR_SNIPPET_MAX_LENGTH } from '../constants';
import { createChatSidebarStyles } from './ChatSidebar.styles';

interface ChatSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onChatSelect: (roomId: string) => void;
  onSettings: () => void;
  onLogout: () => void;
  selectedChatId?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isVisible,
  onClose,
  onNewChat,
  onChatSelect,
  onSettings,
  onLogout,
  selectedChatId,
}) => {
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const { showSuccess } = useToast();
  const { userName } = useUserInfo();
  const { rooms, deleteRoom, fetchRooms } = useChatRooms();
  const styles = createChatSidebarStyles(theme);
  const insets = useSafeAreaInsets();

  // Local state for room drafts loaded from storage
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Animation values
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // First slide the sidebar in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        // Then fade in the backdrop after sidebar is fully open
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // First fade out the backdrop
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        // Then slide the sidebar out
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isVisible, slideAnim, fadeAnim]);

  // Load drafts for visible rooms when sidebar opens or rooms change
  useEffect(() => {
    if (!isVisible) return;
    const loadDrafts = async () => {
      try {
        const entries = await Promise.all(
          rooms.map(async (r) => {
            const key = `chat_draft_${r.id}`;
            const value = await mobileStorage.getItem(key);
            return [r.id.toString(), value ?? ''] as const;
          })
        );
        const next: Record<string, string> = {};
        for (const [id, val] of entries) {
          if (val && val.trim().length > 0) next[id] = val;
        }
        setDrafts(next);
      } catch {
        // noop
      }
    };
    loadDrafts();
  }, [isVisible, rooms]);

  const handleChatSelect = (roomId: string) => {
    console.log('🎯 [SIDEBAR] Chat selected', { 
      roomId, 
      roomIdType: typeof roomId,
      timestamp: new Date().toISOString(),
      availableRooms: rooms.map(r => ({ id: r.id, name: r.name }))
    });
    onChatSelect(roomId);
    onClose();
  };

  const handleNewChat = () => {
    console.log('[SIDEBAR] new chat');
    onNewChat();
    onClose();
  };

  const handleSettings = () => {
    console.log('[SIDEBAR] open settings');
    onClose();
    onSettings();
  };

  const handleDelete = async (roomId: number) => {
    console.log('[SIDEBAR] delete icon pressed', { roomId, selectedChatId });
    try {
      await deleteRoom(roomId);
      console.log('[SIDEBAR] delete success', { roomId });
      // Localized toast
      showSuccess(t('chat.room_deleted'), 2500);
      try {
        const maybePromise = fetchRooms?.();
        if (maybePromise && typeof (maybePromise as any).then === 'function') {
          (maybePromise as Promise<any>).then(() => console.log('[SIDEBAR] rooms refreshed after delete'));
        }
      } catch (e) {
        console.log('[SIDEBAR] fetchRooms error', e);
      }
      if (selectedChatId && selectedChatId === String(roomId)) {
        console.log('[SIDEBAR] deleted current room → redirecting to new chat');
        onNewChat();
        onClose();
      }
    } catch (e) {
      console.log('[SIDEBAR] delete failed', e);
    }
  };

  // Render the draft badge and snippet if a draft exists
  const renderDraftContent = (roomId: string) => {
    const draft = drafts[roomId];
    if (draft && draft.trim().length > 0) {
      const compact = draft.replace(/\s+/g, ' ').trim();
      const snippet = compact.length > SIDEBAR_SNIPPET_MAX_LENGTH 
        ? `${compact.slice(0, SIDEBAR_SNIPPET_MAX_LENGTH)}…` 
        : compact;
      
      return (
        <View style={styles.subtitleRow}>
          <View style={styles.draftBadge}>
            <Text variant="caption" size="xs" weight="semibold" color={theme.colors.status.info.primary}>
              Draft
            </Text>
          </View>
          <Text variant="caption" numberOfLines={1}>
            {snippet}
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sidebarOverlay}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              paddingTop: Platform.OS === 'ios' ? insets.top + 6 : 0,
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<MaterialIcons name="add" size={20} color={theme.colors.text.primary} />}
              label={t('sidebar.new_chat')}
              onPress={handleNewChat}
              containerStyle={styles.newChatButton}
            />
            <Button
              variant="ghost"
              size="sm"
              onPress={onClose}
              leftIcon={<MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />}
            />
          </View>

          {/* Chat History */}
          <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
            {rooms.map((room) => {
              const isSelected = selectedChatId === room.id.toString();
              const draft = drafts[room.id.toString()];
              const hasDraft = draft && draft.trim().length > 0;
              
              // Prepare subtitle content
              let subtitle = room.last_message || t('sidebar.no_messages');
              
              // Prepare right element (delete button)
              const rightElement = (
                <TouchableOpacity
                  style={styles.chatItemDelete}
                  onPress={() => handleDelete(room.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="delete" size={18} color={theme.colors.status.error.primary} />
                </TouchableOpacity>
              );
              
              // Prepare left element (chat icon)
              const leftElement = (
                <MaterialIcons 
                  name="chat" 
                  size={16} 
                  color={isSelected ? theme.colors.primary : theme.colors.text.secondary} 
                />
              );

              return (
                <ListItem
                  key={room.id}
                  variant="chat"
                  title={room.name}
                  subtitle={hasDraft ? undefined : subtitle}
                  description={undefined}
                  leftElement={leftElement}
                  rightElement={rightElement}
                  selected={isSelected}
                  showBorder={false}
                  onPress={() => handleChatSelect(room.id.toString())}
                  containerStyle={styles.chatItem}
                >
                  {hasDraft && renderDraftContent(room.id.toString())}
                </ListItem>
              );
            })}
          </ScrollView>

          {/* User Profile */}
          <View style={styles.userProfile}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={32} color={theme.colors.text.secondary} />
              <Text variant="body" weight="medium" style={styles.userName}>
                {userName || t('sidebar.user')}
              </Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleSettings}
              leftIcon={<MaterialIcons name="settings" size={20} color={theme.colors.text.secondary} />}
              containerStyle={styles.settingsButton}
            />
          </View>
        </Animated.View>
        <Animated.View 
          style={[
            styles.sidebarBackdrop, 
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};
