import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from  "./features/auth/pages/RegisterPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import type { Role } from "./types/auth";
import { getDashboardPath } from "./utils/authRedirect";
import CompanyDashboardPage from "./features/company/pages/CompanyDashboardPage";
import UserDashboardPage from "./features/user/pages/UserDashboardPage";
import UserCompanyProfilePage from "./features/user/pages/UserCompanyProfilePage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import AcceptCompanyInvitePage from "@/features/auth/pages/AcceptCompanyInvitePage";
import OAuth2RedirectPage from "@/features/auth/pages/OAuth2RedirectPage";


function HomePage() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return (
    <main>
      <h1>CVApp</h1>

      <p>You are not logged in.</p>
      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </main>
  );
}

function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
}



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/user"
        element={
          <RequireAuth allowedRoles={["USER"]}>
            <UserDashboardPage />
          </RequireAuth>
        }
      />

      <Route
  path="/accept-invite"
  element={<AcceptCompanyInvitePage />}
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

      <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

    </Routes>
  );
}