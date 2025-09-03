// src/features/chat/context/ChatContext.tsx
import type { ChatMessage } from "@/entities/message";
import React, { createContext, ReactNode, useContext } from "react";

// Define the shape of the context
interface ChatContextType {
  currentRoomId: number | null;
  isLoading: boolean;
  messages: ChatMessage[];
  selectedModel: string;
  updateModel: (model: string) => void;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
  value: ChatContextType;
}

export const ChatProvider = ({ children, value }: ChatProviderProps) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
