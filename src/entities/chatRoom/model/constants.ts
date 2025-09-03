// src/entities/chatRoom/model/constants.ts

export const ROOM_CONSTRAINTS = {
  NAME_MAX_LENGTH: 80,
  DEFAULT_NAME_PREFIX: "Chat",
} as const;

export const ROOM_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;
