import '@testing-library/jest-dom';

// Mock React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock for DevMenu
  RN.NativeModules.DevMenu = {
    show: jest.fn(),
    reload: jest.fn(),
  };

  return RN;
});


// Mock console methods
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      })),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
}));

// Mock mobileStorage
jest.mock('./src/shared/lib/mobileStorage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock sendMessage service
jest.mock('./src/features/chat/services/sendMessage/index', () => ({
  sendMessageHandler: jest.fn(),
}));

// Mock useChatRooms hook
jest.mock('./src/features/chat/hooks/useChatRooms', () => ({
  useChatRooms: jest.fn(() => ({
    rooms: [],
    loading: false,
  })),
}));

// Mock useOptimisticMessages hook
jest.mock('./src/features/chat/hooks/useOptimisticMessages', () => ({
  useOptimisticMessages: jest.fn(() => ({
    optimisticMessages: null,
    optimisticModel: null,
  })),
}));

// Mock useMessageInput hook
jest.mock('./src/features/chat/hooks/useMessageInput', () => ({
  useMessageInput: jest.fn(() => ({
    input: '',
    setInput: jest.fn(),
    handleInputChange: jest.fn(),
    clearInput: jest.fn(),
    drafts: {},
    setDrafts: jest.fn(),
  })),
}));

// Mock getSession
jest.mock('./src/shared/lib/supabase/getSession', () => ({
  getSession: jest.fn(() => Promise.resolve({ user: { id: 'test-user-id' } })),
}));

// Mock ServiceRegistry
jest.mock('./src/features/chat/services/core/ServiceRegistry', () => ({
  ServiceRegistry: {
    register: jest.fn(),
    getConfig: jest.fn(() => ({
      messageService: {
        loadMessages: jest.fn(() => Promise.resolve([])),
      },
    })),
    createMessageService: jest.fn(() => ({
      loadMessages: jest.fn(() => Promise.resolve([])),
    })),
  },
}));

// Mock ServiceFactory
jest.mock('./src/features/chat/services/core/ServiceFactory', () => ({
  ServiceFactory: {
    createMessageService: jest.fn(() => ({
      loadMessages: jest.fn(() => Promise.resolve([])),
    })),
  },
})); 