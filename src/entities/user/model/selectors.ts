// src/entities/user/model/selectors.ts

import type { UserInfo } from "./types";

export const selectUserName = (userInfo: UserInfo): string => userInfo.userName;
export const selectUserEmail = (userInfo: UserInfo): string | null =>
  userInfo.email;
export const selectUserId = (userInfo: UserInfo): string | null =>
  userInfo.userId;
export const selectUserLoading = (userInfo: UserInfo): boolean =>
  userInfo.loading;
