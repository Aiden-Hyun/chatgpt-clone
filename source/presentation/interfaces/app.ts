/**
 * App Presentation Interfaces
 * 
 * All app-related interfaces for the presentation layer.
 */

import { TextInput } from 'react-native';

// ============================================================================
// APP CHAT INTERFACES
// ============================================================================

/**
 * Chat screen props
 */
export interface ChatScreenProps {
  roomId?: string;
  isTemporaryRoom: boolean;
  numericRoomId: number | null;
  chatScreenState: {
    inputRef: React.RefObject<TextInput> | null;
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSendMessage: () => void;
    isLoading: boolean;
    selectedModel: string;
    handleModelChange: (model: string) => void;
    handleLogout: () => void;
    handleBack: () => void;
  };
}

// ============================================================================
// APP SETTINGS INTERFACES
// ============================================================================

/**
 * Account section props
 */
export interface AccountSectionProps {
  userName: string | null;
  email: string | null;
  onRefresh: () => Promise<void>;
}

/**
 * Preferences section props
 */
export interface PreferencesSectionProps {
  onNavigateToThemes: () => void;
}

/**
 * Settings header props
 */
export interface SettingsHeaderProps {
  onBack: () => void;
  title: string;
}
