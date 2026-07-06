import { createContext, useContext, useMemo, useState } from "react";
import * as authApi from "../api/authApi";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Role,
  AcceptCompanyInviteRequest,
  OAuthExchangeRequest
} from "../types/auth";

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  acceptCompanyInvite: (
    request: AcceptCompanyInviteRequest
  ) => Promise<AuthResponse>

    completeOAuthLogin: (request: OAuthExchangeRequest) => Promise<AuthResponse>;

};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredRole(): Role | null {
  const storedRole = localStorage.getItem("role");

  if (
    storedRole === "USER" ||
    storedRole === "COMPANY" ||
    storedRole === "ADMIN"
  ) {
    return storedRole;
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem("refreshToken")
  );

  const [role, setRole] = useState<Role | null>(() => getStoredRole());

  function saveAuth(response: AuthResponse) {
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("role", response.role);

    setAccessToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setRole(response.role);
  }

  async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.login(request);
    saveAuth(response);
    return response;
  }

  async function register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await authApi.register(request);
    saveAuth(response);
    return response;
  }

  async function logout() {
    const currentRefreshToken = localStorage.getItem("refreshToken");

    try {
      if (currentRefreshToken) {
        await authApi.logout({ refreshToken: currentRefreshToken });
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");

      setAccessToken(null);
      setRefreshToken(null);
      setRole(null);
    }
  }

  async function acceptCompanyInvite(
  request: AcceptCompanyInviteRequest
): Promise<AuthResponse> {
  const response = await authApi.acceptCompanyInvite(request);
  saveAuth(response);
  return response;
}

async function completeOAuthLogin(request: OAuthExchangeRequest): Promise<AuthResponse> {
    const response = await authApi.exchangeOAuthCode(request);
    saveAuth(response);
    return response;
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      refreshToken,
      role,
      isAuthenticated: Boolean(accessToken),
      login,
      register,
      acceptCompanyInvite,
      completeOAuthLogin,
      logout,
    }),
    [accessToken, refreshToken, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}