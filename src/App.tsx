import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import type { Role } from "./types/auth";
import { getDashboardPath } from "./utils/authRedirect";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserCompanyProfilePage from "./pages/UserCompanyProfilePage";

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



function AdminDashboardPage() {
  const { logout } = useAuth();

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Only admins should see this page.</p>
      <button onClick={logout}>Logout</button>
    </main>
  );
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