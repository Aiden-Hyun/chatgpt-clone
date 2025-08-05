import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLanguageContext } from '../../../../features/language';
import { useAppTheme } from '../../../../shared/hooks';
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
  const { userName } = useUserInfo();
  const { rooms } = useChatRooms();
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
    onChatSelect(roomId);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleSettings = () => {
    onClose();
    onSettings();
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
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.chatItem,
                  selectedChatId === room.id.toString() && styles.selectedChatItem
                ]}
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