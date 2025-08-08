import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLanguageContext } from '../../../../features/language';
import { useAppTheme } from '../../../../shared/hooks';
import { useToast } from '../../../alert';
import { useUserInfo } from '../../../auth';
import { useChatRooms } from '../../../chat/hooks';
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

  // Animation values
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // First slide the sidebar in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Then fade in the backdrop after sidebar is fully open
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // First fade out the backdrop
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        // Then slide the sidebar out
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isVisible, slideAnim, fadeAnim]);

  const handleChatSelect = (roomId: string) => {
    console.log('[SIDEBAR] select chat', { roomId });
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

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sidebarOverlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
              <MaterialIcons name="add" size={20} color={theme.colors.text.primary} />
              <Text style={styles.newChatText}>{t('sidebar.new_chat')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Chat History */}
          <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
            {rooms.map((room) => (
              <View
                key={room.id}
                style={[
                  styles.chatItem,
                  selectedChatId === room.id.toString() && styles.selectedChatItem
                ]}
              >
                <TouchableOpacity
                  style={styles.chatItemMain}
                  onPress={() => handleChatSelect(room.id.toString())}
                >
                  <MaterialIcons 
                    name="chat" 
                    size={16} 
                    color={selectedChatId === room.id.toString() ? theme.colors.primary : theme.colors.text.secondary} 
                  />
                  <View style={styles.chatItemContent}>
                    <Text style={[
                      styles.chatItemTitle,
                      selectedChatId === room.id.toString() && styles.selectedChatItemTitle
                    ]}>
                      {room.name}
                    </Text>
                    <Text style={styles.chatItemSubtitle}>
                      {room.last_message || t('sidebar.no_messages')}
                    </Text>
                  </View>
                  <Text style={styles.chatItemTime}>
                    {room.updated_at ? new Date(room.updated_at).toLocaleDateString() : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chatItemDelete}
                  onPress={() => handleDelete(room.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="delete" size={18} color={theme.colors.status.error.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* User Profile */}
          <View style={styles.userProfile}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={32} color={theme.colors.text.secondary} />
              <Text style={styles.userName}>{userName || t('sidebar.user')}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <MaterialIcons name="settings" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
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