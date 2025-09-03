// src/entities/user/model/types.ts

export interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}
