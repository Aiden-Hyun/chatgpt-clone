// src/entities/chatRoom/model/selectors.ts

import type { ChatRoom, ChatRoomWithLastMsg } from "./types";

export const selectRoomById = (
  rooms: ChatRoom[] | ChatRoomWithLastMsg[],
  id: number
): ChatRoom | ChatRoomWithLastMsg | undefined =>
  rooms.find((room) => room.id === id);

export const selectRoomsByModel = (
  rooms: ChatRoom[] | ChatRoomWithLastMsg[],
  model: string
): ChatRoom[] | ChatRoomWithLastMsg[] =>
  rooms.filter((room) => (room as any).model === model);

export const selectMostRecentRoom = (
  rooms: ChatRoomWithLastMsg[]
): ChatRoomWithLastMsg | undefined =>
  rooms.sort((a, b) => {
    const at = a.last_activity ? new Date(a.last_activity).getTime() : 0;
    const bt = b.last_activity ? new Date(b.last_activity).getTime() : 0;
    return bt - at;
  })[0];

export const selectRoomsWithMessages = (
  rooms: ChatRoomWithLastMsg[]
): ChatRoomWithLastMsg[] =>
  rooms.filter((room) => room.last_message && room.last_activity);
