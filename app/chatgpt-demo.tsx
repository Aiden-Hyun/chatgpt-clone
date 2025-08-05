import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUserInfo } from '../src/features/auth';
import { useAppTheme } from '../src/shared/hooks';

// Mock chat data for demo
const MOCK_CHATS = [
  { id: '1', name: 'How to build a React Native app', lastMessage: 'Thanks for the help!', timestamp: '2 hours ago' },
  { id: '2', name: 'JavaScript best practices', lastMessage: 'That makes sense now', timestamp: '1 day ago' },
  { id: '3', name: 'API integration tips', lastMessage: 'I\'ll try that approach', timestamp: '3 days ago' },
  { id: '4', name: 'Database design patterns', lastMessage: 'Very helpful explanation', timestamp: '1 week ago' },
];

export default function ChatGPTDemoScreen() {
  const theme = useAppTheme();
  const { userName } = useUserInfo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<{id: string, text: string, isUser: boolean, timestamp: string}[]>([
    { id: '1', text: 'Hello! I\'m your AI assistant. How can I help you today?', isUser: false, timestamp: 'Just now' }
  ]);

  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSidebarOpen) {
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
  }, [isSidebarOpen, slideAnim, fadeAnim]);

  const styles = createStyles(theme);

  const handleNewChat = () => {
    setCurrentChat(null);
    setMessages([{ id: '1', text: 'Hello! I\'m your AI assistant. How can I help you today?', isUser: false, timestamp: 'Just now' }]);
    setIsSidebarOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    const chat = MOCK_CHATS.find(c => c.id === chatId);
    setMessages([
      { id: '1', text: `Welcome to "${chat?.name}"! This is a demo of the chat interface.`, isUser: false, timestamp: 'Just now' }
    ]);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: 'Just now'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: 'This is a demo response. In the real app, this would be an AI-generated response based on your message.',
        isUser: false,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const Sidebar = () => (
    <Modal
      visible={isSidebarOpen}
      transparent
      animationType="none"
      onRequestClose={() => setIsSidebarOpen(false)}
    >
      <View style={styles.sidebarOverlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
              <MaterialIcons name="add" size={20} color={theme.colors.text.primary} />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Chat History */}
          <ScrollView style={styles.chatHistory} showsVerticalScrollIndicator={false}>
            {MOCK_CHATS.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[
                  styles.chatItem,
                  currentChat === chat.id && styles.selectedChatItem
                ]}
                onPress={() => handleChatSelect(chat.id)}
              >
                <MaterialIcons 
                  name="chat" 
                  size={16} 
                  color={currentChat === chat.id ? theme.colors.primary : theme.colors.text.secondary} 
                />
                <View style={styles.chatItemContent}>
                  <Text style={[
                    styles.chatItemTitle,
                    currentChat === chat.id && styles.selectedChatItemTitle
                  ]}>
                    {chat.name}
                  </Text>
                  <Text style={styles.chatItemSubtitle}>{chat.lastMessage}</Text>
                </View>
                <Text style={styles.chatItemTime}>{chat.timestamp}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* User Profile */}
          <View style={styles.userProfile}>
            <View style={styles.userInfo}>
              <MaterialIcons name="account-circle" size={32} color={theme.colors.text.secondary} />
              <Text style={styles.userName}>{userName || 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
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
            onPress={() => setIsSidebarOpen(false)}
            activeOpacity={1}
          />
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setIsSidebarOpen(true)}
        >
          <MaterialIcons name="menu" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {currentChat ? MOCK_CHATS.find(c => c.id === currentChat)?.name : 'New Chat'}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.isUser ? styles.userMessage : styles.aiMessage
          ]}>
            <View style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={styles.messageTime}>{message.timestamp}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={inputText.trim() ? theme.colors.primary : theme.colors.text.tertiary} 
          />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  headerSpacer: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  aiBubble: {
    backgroundColor: theme.colors.background.secondary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: theme.colors.button.text,
  },
  aiMessageText: {
    color: theme.colors.text.primary,
  },
  messageTime: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: 320,
    backgroundColor: theme.colors.background.primary,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border.light,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background.secondary,
  },
  newChatText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  chatHistory: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  selectedChatItem: {
    backgroundColor: theme.colors.background.secondary,
  },
  chatItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  selectedChatItemTitle: {
    color: theme.colors.primary,
  },
  chatItemSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  chatItemTime: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  settingsButton: {
    padding: 8,
  },
}); 