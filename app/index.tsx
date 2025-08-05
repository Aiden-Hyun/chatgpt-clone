import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useToast } from '../src/features/alert';
import { useLogout, useUserInfo } from '../src/features/auth';
import { RoomListItem } from '../src/features/chat/components';
import { useChatRooms } from '../src/features/chat/hooks';
import { useLanguageContext } from '../src/features/language';
import { LoadingWrapper, QuickActionsMenu } from '../src/features/ui';
import { useRefreshOnFocus } from '../src/shared/hooks';
import { createIndexStyles } from './index.styles';

export default function HomeScreen() {
  const { rooms, loading, fetchRooms, deleteRoom, startNewChat } = useChatRooms();
  const { userName } = useUserInfo();
  const { logout, isLoggingOut } = useLogout();
  const { t } = useLanguageContext();
  const { showSuccess } = useToast();
  const styles = createIndexStyles();
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);

  // Refresh rooms when screen comes into focus
  useRefreshOnFocus(fetchRooms, [fetchRooms]);

  // Handle room deletion with toast notification
  const handleDeleteRoom = async (roomId: number) => {
    try {
      await deleteRoom(roomId);
      showSuccess(t('chat.room_deleted'), 3000);
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  return (
    <LoadingWrapper loading={loading}>
      {rooms.length === 0 ? (
        <SafeAreaView style={styles.center}>
          <Text style={styles.emptyStateText}>{t('home.no_conversations')}</Text>
          <TouchableOpacity style={styles.newButton} onPress={startNewChat}>
            <Text style={styles.buttonText}>{t('home.new_conversation')}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.container}>
          {/* Quick Actions Menu Button */}
          <TouchableOpacity 
            style={styles.settingsMenuButton} 
            onPress={() => setIsQuickActionsVisible(!isQuickActionsVisible)}
          >
            <MaterialIcons name="more-vert" size={24} color={styles.settingsMenuText.color} />
          </TouchableOpacity>
          
          {userName && (
            <Text style={styles.welcomeText}>
              {t('home.hello')}, {userName}
            </Text>
          )}
          <TouchableOpacity style={styles.newButton} onPress={startNewChat}>
            <Text style={styles.buttonText}>{t('home.new_conversation')}</Text>
          </TouchableOpacity>
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RoomListItem
                room={item}
                onPress={() => router.push({ pathname: '/chat/[roomId]', params: { roomId: item.id.toString(), room: item.name } })}
                onDelete={() => handleDeleteRoom(item.id)}
              />
            )}
          />

        </SafeAreaView>
      )}
      
      {/* Quick Actions Menu Dropdown */}
      <QuickActionsMenu 
        isVisible={isQuickActionsVisible} 
        onClose={() => setIsQuickActionsVisible(false)}
        onLogout={logout}
        onSettings={() => {
          router.push('/settings');
        }}
        onDesignShowcase={() => {
          router.push('/design-showcase');
        }}
      />
    </LoadingWrapper>
  );
} 