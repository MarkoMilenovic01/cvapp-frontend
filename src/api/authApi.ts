import { apiRequest } from "./apiClient";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  OAuthExchangeRequest,
  ResetPasswordRequest,
  AcceptCompanyInviteRequest
} from "../types/auth";

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: request,
  });
}

export function refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: request,
  });
}

export function logout(request: RefreshTokenRequest): Promise<void> {
  return apiRequest<void>("/api/auth/logout", {
    method: "POST",
    body: request,
  });
}

export function forgotPassword(request: ForgotPasswordRequest): Promise<void> {
  return apiRequest<void>("/api/auth/forgot-password", {
    method: "POST",
    body: request,
  });
}

export function resetPassword(request: ResetPasswordRequest): Promise<void> {
  return apiRequest<void>("/api/auth/reset-password", {
    method: "POST",
    body: request,
  });
}

export function acceptCompanyInvite(
  request: AcceptCompanyInviteRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/company-invites/accept", {
    method: "POST",
    body: request,
  });
}


export function exchangeOAuthCode(request: OAuthExchangeRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/oauth/exchange", {
    method: "POST",
    body: request,
  });
}