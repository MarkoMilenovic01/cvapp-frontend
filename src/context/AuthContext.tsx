import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import * as authApi from "../api/authApi";
import {
  setApiAccessToken,
  setApiRefreshHandler,
} from "../api/apiClient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  Role,
  AcceptCompanyInviteRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth";

type AuthContextValue = {
  accessToken: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<RegisterResponse>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  verifyEmail: (request: VerifyEmailRequest) => Promise<void>;
  resendVerification: (request: ResendVerificationRequest) => Promise<void>;
  logout: () => Promise<void>;
  acceptCompanyInvite: (
    request: AcceptCompanyInviteRequest
  ) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
let sessionRefreshPromise: Promise<AuthResponse> | null = null;

function refreshSessionOnce() {
  sessionRefreshPromise ??= authApi.refreshToken().finally(() => {
    sessionRefreshPromise = null;
  });

  return sessionRefreshPromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      try {
        const response = await refreshSessionOnce();

        if (active) {
          saveAuth(response);
        }

        return response.accessToken;
      } catch {
        if (active) {
          clearAuth();
        }

        return null;
      }
    };

    setApiRefreshHandler(refreshSession);
    void refreshSession().finally(() => {
      if (active) {
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      setApiRefreshHandler(null);
    };
  }, []);

  function saveAuth(response: AuthResponse) {
    setApiAccessToken(response.accessToken);
    setAccessToken(response.accessToken);
    setRole(response.role);
  }

  function clearAuth() {
    setApiAccessToken(null);
    setAccessToken(null);
    setRole(null);
  }

  async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.login(request);
    saveAuth(response);
    return response;
  }

  async function register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await authApi.register(request);
    return response;
  }

  const forgotPassword = (request: ForgotPasswordRequest) =>
    authApi.forgotPassword(request);

  const resetPassword = (request: ResetPasswordRequest) =>
    authApi.resetPassword(request);

  const verifyEmail = (request: VerifyEmailRequest) =>
    authApi.verifyEmail(request);

  const resendVerification = (request: ResendVerificationRequest) =>
    authApi.resendVerification(request);

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }

  async function acceptCompanyInvite(
    request: AcceptCompanyInviteRequest
  ): Promise<AuthResponse> {
    const response = await authApi.acceptCompanyInvite(request);
    saveAuth(response);
    return response;
  }

  async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await authApi.loginWithGoogle({ idToken });
    saveAuth(response);
    return response;
  }

  const value: AuthContextValue = {
    accessToken,
    role,
    isAuthenticated: Boolean(accessToken && role),
    isLoading,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    logout,
    acceptCompanyInvite,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its hook intentionally live together as one public module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
