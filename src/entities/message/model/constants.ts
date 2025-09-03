// src/entities/message/model/constants.ts

export const MESSAGE_STATES = {
  LOADING: "loading",
  ANIMATING: "animating",
  COMPLETED: "completed",
  HYDRATED: "hydrated",
  ERROR: "error",
} as const;

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;
