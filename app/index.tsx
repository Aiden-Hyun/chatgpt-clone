import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useLogout, useUserInfo } from '../src/features/auth';
import { RoomListItem } from '../src/features/chat/components';
import { useChatRooms } from '../src/features/chat/hooks';
import { LoadingWrapper, QuickActionsMenu } from '../src/shared/components';
import { useLanguageContext } from '../src/shared/context/LanguageContext';
import { useRefreshOnFocus } from '../src/shared/hooks';
import { createIndexStyles } from './index.styles';

export default function HomeScreen() {
  const { rooms, loading, fetchRooms, deleteRoom, startNewChat } = useChatRooms();
  const { userName } = useUserInfo();
  const { logout, isLoggingOut } = useLogout();
  const { t } = useLanguageContext();
  const styles = createIndexStyles();
  const [isQuickActionsVisible, setIsQuickActionsVisible] = useState(false);

  // Refresh rooms when screen comes into focus
  useRefreshOnFocus(fetchRooms, [fetchRooms]);

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
            <Text style={styles.settingsMenuText}>⋯</Text>
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
                onDelete={() => deleteRoom(item.id)}
              />
            )}
          />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutText}>
              {isLoggingOut ? t('home.logging_out') : t('home.logout')}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
      
      {/* Quick Actions Menu Dropdown */}
      <QuickActionsMenu 
        isVisible={isQuickActionsVisible} 
        onClose={() => setIsQuickActionsVisible(false)} 
      />
    </LoadingWrapper>
  );
} 