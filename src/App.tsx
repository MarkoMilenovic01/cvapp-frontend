import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import type { Role } from "./types/auth";
import { getDashboardPath } from "./utils/authRedirect";

import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import AcceptCompanyInvitePage from "@/features/auth/pages/AcceptCompanyInvitePage";

import CompanyDashboardPage from "./features/company/pages/CompanyDashboardPage";
import UserDashboardPage from "./features/user/pages/UserDashboardPage";
import UserCompanyProfilePage from "./features/user/pages/UserCompanyProfilePage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";

function HomePage() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && role) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
}

function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPasswordPage />
          </PublicOnly>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicOnly>
            <ResetPasswordPage />
          </PublicOnly>
        }
      />

      <Route
        path="/verify-email"
        element={
          <PublicOnly>
            <VerifyEmailPage />
          </PublicOnly>
        }
      />

      <Route
        path="/accept-invite"
        element={
          <PublicOnly>
            <AcceptCompanyInvitePage />
          </PublicOnly>
        }
      />

      <Route
        path="/user"
        element={
          <RequireAuth allowedRoles={["USER"]}>
            <UserDashboardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/companies/:companyId"
        element={
          <RequireAuth allowedRoles={["USER"]}>
            <UserCompanyProfilePage />
          </RequireAuth>
        }
      />

      <Route
        path="/company"
        element={
          <RequireAuth allowedRoles={["COMPANY"]}>
            <CompanyDashboardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
