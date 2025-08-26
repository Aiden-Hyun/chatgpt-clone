// DTOs for authentication operations
export interface SignInDTO {
  email: string;
  password: string;
}

export interface SignUpDTO {
  email: string;
  password: string;
}

export interface AuthResultDTO {
  user: {
    id: string;
    email: string;
  };
  session: {
    accessToken: string;
    expiresAt: Date;
  };
  success: boolean;
  error?: string;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface UpdateProfileDTO {
  userId: string;
  email?: string;
}
