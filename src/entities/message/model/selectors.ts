// src/entities/message/model/selectors.ts

import type { ChatMessage, MessageState } from "./types";

export const selectMessageById = (
  messages: ChatMessage[],
  id: string
): ChatMessage | undefined => messages.find((msg) => msg.id === id);

export const selectMessagesByState = (
  messages: ChatMessage[],
  state: MessageState
): ChatMessage[] => messages.filter((msg) => msg.state === state);

export const selectMessagesByRole = (
  messages: ChatMessage[],
  role: ChatMessage["role"]
): ChatMessage[] => messages.filter((msg) => msg.role === role);

export const selectLastMessage = (
  messages: ChatMessage[]
): ChatMessage | undefined => messages[messages.length - 1];

export const selectLastAssistantMessage = (
  messages: ChatMessage[]
): ChatMessage | undefined =>
  [...messages].reverse().find((msg) => msg.role === "assistant");
