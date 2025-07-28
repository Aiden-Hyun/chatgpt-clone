import { router } from 'expo-router';
import { FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { useLogout, useUserInfo } from '../../../src/features/auth';
import { RoomListItem } from '../../../src/features/chat/components';
import { useChatRooms } from '../../../src/features/chat/hooks';
import { LoadingWrapper } from '../../../src/shared/components';
import { useRefreshOnFocus } from '../../../src/shared/hooks';
import { createIndexStyles } from './index.styles';

export default function HomeScreen() {
  const { rooms, loading, fetchRooms, deleteRoom, startNewChat } = useChatRooms();
  const { userName } = useUserInfo();
  const { logout, isLoggingOut } = useLogout();
  const styles = createIndexStyles();

  // Refresh rooms when screen comes into focus
  useRefreshOnFocus(fetchRooms, [fetchRooms]);

  return (
    <LoadingWrapper loading={loading}>
      {rooms.length === 0 ? (
        <SafeAreaView style={styles.center}>
          <Text style={styles.emptyStateText}>No conversations yet.</Text>
          <TouchableOpacity style={styles.newButton} onPress={startNewChat}>
            <Text style={styles.buttonText}>New Conversation</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.container}>
          {userName && (
            <Text style={styles.welcomeText}>
              Hello, {userName}
            </Text>
          )}
          <TouchableOpacity style={styles.newButton} onPress={startNewChat}>
            <Text style={styles.buttonText}>New Conversation</Text>
          </TouchableOpacity>
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RoomListItem
                room={item}
                onPress={() => router.push({ pathname: '/(tabs)/(chat)/[roomId]', params: { roomId: item.id.toString(), room: item.name } })}
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
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </LoadingWrapper>
  );

}
