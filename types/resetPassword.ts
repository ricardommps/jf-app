export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    lastPasswordChange: string;
    userId: string;
  };
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ResetPasswordResult = {
  success: boolean;
  message?: string;
  customer?: any;
};
