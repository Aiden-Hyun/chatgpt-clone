// src/entities/session/model/constants.ts

export const AUTH_EVENTS = {
  SIGNED_IN: "SIGNED_IN",
  SIGNED_OUT: "SIGNED_OUT",
  TOKEN_REFRESHED: "TOKEN_REFRESHED",
} as const;

export type AuthEvent = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];
