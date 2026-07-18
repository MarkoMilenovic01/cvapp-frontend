import { apiRequest } from "./apiClient";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  ResetPasswordRequest,
  AcceptCompanyInviteRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "../types/auth";

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function register(request: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function refreshToken(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export function forgotPassword(request: ForgotPasswordRequest): Promise<void> {
  return apiRequest<void>("/api/auth/forgot-password", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function resetPassword(request: ResetPasswordRequest): Promise<void> {
  return apiRequest<void>("/api/auth/reset-password", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function verifyEmail(request: VerifyEmailRequest): Promise<void> {
  return apiRequest<void>("/api/auth/verify-email", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function resendVerification(
  request: ResendVerificationRequest,
): Promise<void> {
  return apiRequest<void>("/api/auth/resend-verification", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}

export function acceptCompanyInvite(
  request: AcceptCompanyInviteRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/company-invites/accept", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}


export function loginWithGoogle(request: GoogleLoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/oauth/google", {
    method: "POST",
    body: request,
    skipAuthRefresh: true,
  });
}
