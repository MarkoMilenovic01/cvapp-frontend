import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/authRedirect";
import { getOAuthErrorMessage } from "../utils/oauthErrors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const oauthError = getOAuthErrorMessage(searchParams.get("oauthError"));

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      const response = await login({ email, password });
      navigate(getDashboardPath(response.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Something went wrong");
      }
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  }

  return (
    <main>
      <h1>Login</h1>
      {oauthError && <p>{oauthError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {fieldErrors.email && <p>{fieldErrors.email}</p>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {fieldErrors.password && <p>{fieldErrors.password}</p>}
        </div>
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <button type="button" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
    </main>
  );
}