// Test Chat Interface that creates a room if it doesn't exist
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../auth/context/AuthContext';
import { TestChatInterfaceProps } from '../../interfaces/chat';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

import { ChatInterface } from './ChatInterface';

export function TestChatInterface({ userId }: TestChatInterfaceProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSettingUpRef = useRef(false);
  
  const { useCaseFactory } = useBusinessContext();
  const { session } = useAuth();

  const TEST_ROOM_NAME = 'Test Room for New Features';
  const storageKey = `source_test_room_${userId}`;

  async function getSavedRoomId(): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(storageKey);
      return value || null;
    } catch {
      return null;
    }
  }

  async function saveRoomId(id: string) {
    try { await AsyncStorage.setItem(storageKey, id); } catch {}
  }

  async function verifyRoomExists(id: string): Promise<boolean> {
    try {
      const repo = useCaseFactory.getChatRoomRepository();
      const room = await repo.getById(id, session!);
      return !!room && room.userId === userId;
    } catch {
      return false;
    }
  }

  async function findExistingTestRoom(): Promise<string | null> {
    try {
      const repo = useCaseFactory.getChatRoomRepository();
      const rooms = await repo.listByUserId(userId, session!);
      const existing = rooms.find(r => r.name === TEST_ROOM_NAME);
      return existing ? existing.id : null;
    } catch (e) {
      console.warn('[TestChatInterface] Failed to list rooms, will create a new one:', e);
      return null;
    }
  }

  const createOrReuseTestRoom = async () => {
    if (!session) {
      setError('Authentication required');
      return;
    }
    if (isSettingUpRef.current || isCreatingRoom || roomId) return;
    isSettingUpRef.current = true;

    setIsCreatingRoom(true);
    setError(null);

    try {
      // 1) Prefer stored room id if still valid
      const storedId = await getSavedRoomId();
      if (storedId && await verifyRoomExists(storedId)) {
        setRoomId(storedId);
        console.log('✅ Reusing stored test room:', storedId);
        return;
      }

      // 2) Otherwise look up by name
      const existingId = await findExistingTestRoom();
      if (existingId) {
        setRoomId(existingId);
        await saveRoomId(existingId);
        console.log('✅ Reusing existing test room:', existingId);
        return;
      }

      // 3) Create new
      const createRoomUseCase = useCaseFactory.createCreateRoomUseCase();
      const result = await createRoomUseCase.execute({
        model: 'gpt-3.5-turbo',
        name: TEST_ROOM_NAME,
        session
      });

      if (result.success && result.room) {
        setRoomId(result.room.id);
        await saveRoomId(result.room.id);
        console.log('✅ Test room created:', result.room.id);
      } else {
        setError(result.error || 'Failed to create test room');
      }
    } catch (error) {
      console.error('❌ Error creating test room:', error);
      setError('Failed to create test room');
    } finally {
      setIsCreatingRoom(false);
      isSettingUpRef.current = false;
    }
  };

  // Auto-setup room on mount or when session is available
  useEffect(() => {
    if (session) {
      createOrReuseTestRoom();
    }
   
  }, [session]);

  if (isCreatingRoom) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Creating test room...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={createOrReuseTestRoom}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!roomId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Setting up test environment...</Text>
      </View>
    );
  }

  return (
    <ChatInterface 
      roomId={roomId}
      userId={userId}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
