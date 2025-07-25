import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { RoomListItem } from '../../src/features/chat/components';
import { useChatRooms } from '../../src/features/chat/hooks';
import { supabase } from '../../src/shared/lib/supabase';
import { createIndexStyles } from './index.styles';

export default function HomeScreen() {
  const { rooms, loading, fetchRooms, deleteRoom, startNewChat } = useChatRooms();
  const [userName, setUserName] = useState<string>('');
  const styles = createIndexStyles();
  
  // Get user's name from session
  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Try to get name from user metadata or use email as fallback
        const name = session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 
                    'User';
        setUserName(name);
      }
    };
    getUserInfo();
  }, []);

  const refreshOnFocus = useCallback(() => {
    fetchRooms();
  }, [fetchRooms]);

  useFocusEffect(refreshOnFocus);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyStateText}>No conversations yet.</Text>
        <TouchableOpacity style={styles.newButton} onPress={startNewChat}>
          <Text style={styles.buttonText}>New Conversation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
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
            onPress={() => router.push({ pathname: '/chat', params: { roomId: item.id.toString(), room: item.name } })}
            onDelete={() => deleteRoom(item.id)}
          />
        )}
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
