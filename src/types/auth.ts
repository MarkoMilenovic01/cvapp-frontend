export type Role = "USER" | "COMPANY" | "ADMIN";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  role: Role;
}

export interface RegisterResponse {
  message: string;
}

export interface AcceptCompanyInviteRequest{
  token: string;
  password: string;
  confirmPassword:string;
}


export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  details?: Record<string, string>;
}

export interface GoogleLoginRequest {
  idToken: string;
}
