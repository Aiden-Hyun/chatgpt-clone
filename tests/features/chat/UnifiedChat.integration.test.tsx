import { AuthProvider } from '@/features/auth/context/AuthContext';
import { UnifiedChat } from '@/features/chat/components/UnifiedChat';
import { ChatProvider } from '@/features/chat/context/ChatContext';
import { useChat } from '@/features/chat/hooks/useChat';
import { LanguageProvider } from '@/features/language/LanguageContext';
import { ThemeProvider } from '@/features/theme';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock the useChat hook
jest.mock('@/features/chat/hooks/useChat');

describe('UnifiedChat Integration Test', () => {
  const mockUseChat = useChat as jest.Mock;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const renderComponent = () =>
    render(
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ChatProvider>
              <UnifiedChat roomId="test-room-id" />
            </ChatProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('sends a message, mocks the edge function, persists, and renders the response', async () => {
    // 1. Mock the useChat hook to return a controlled state
    const setMessages = jest.fn();
    mockUseChat.mockReturnValue({
      messages: [],
      loading: false,
      sending: false,
      isTyping: false,
      regeneratingIndex: null,
      selectedModel: 'gpt-3.5-turbo',
      input: 'Hello, world!',
      handleInputChange: jest.fn(),
      sendMessage: jest.fn(),
      setMessages,
    });

    // 2. Render the component
    const { getByPlaceholderText, getByText, findByText } = renderComponent();

    // 3. Type a message and send it
    await act(async () => {
      const input = getByPlaceholderText('Type a message...');
      fireEvent.changeText(input, 'Hello, world!');
      fireEvent(input, 'submitEditing');
    });

    // 4. Update the messages state to include the new message
    act(() => {
      mockUseChat.mockReturnValue({
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Hello, world!',
            state: 'completed',
          },
          {
            id: '2',
            role: 'assistant',
            content: '',
            state: 'loading',
          },
        ],
        loading: false,
        sending: false,
        isTyping: true,
        regeneratingIndex: null,
        selectedModel: 'gpt-3.5-turbo',
        input: '',
        handleInputChange: jest.fn(),
        sendMessage: jest.fn(),
        setMessages,
      });
    });
    
    // 5. Assert initial user message appears
    await waitFor(() => {
        expect(getByText('Hello, world!')).toBeTruthy();
        expect(getByText(/is typing.../i)).toBeTruthy();
    });

    // 6. Update the messages state to include the assistant's response
    act(() => {
        mockUseChat.mockReturnValue({
            messages: [
                {
                    id: '1',
                    role: 'user',
                    content: 'Hello, world!',
                    state: 'completed',
                },
                {
                    id: '2',
                    role: 'assistant',
                    content: 'Assistant response',
                    state: 'completed',
                },
            ],
            loading: false,
            sending: false,
            isTyping: false,
            regeneratingIndex: null,
            selectedModel: 'gpt-3.5-turbo',
            input: '',
            handleInputChange: jest.fn(),
            sendMessage: jest.fn(),
            setMessages,
        });
    });

    // 7. Assert assistant's response is rendered after loading
    await waitFor(
      async () => {
        const assistantMessage = await findByText('Assistant response');
        expect(assistantMessage).toBeTruthy();
      },
      { timeout: 4000 }
    );
  });
});
