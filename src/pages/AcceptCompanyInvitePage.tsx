import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/authRedirect";

export default function AcceptCompanyInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { acceptCompanyInvite } = useAuth();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setFieldErrors({});

    if (!token) {
      setError("Invite token is missing.");
      return;
    }

    try {
      const response = await acceptCompanyInvite({
        token,
        password,
        confirmPassword,
      });

      setMessage("Invite accepted successfully.");

      navigate(getDashboardPath(response.role), {
        replace: true,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Something went wrong while accepting invite");
      }
    }
  }

  return (
    <main>
      <h1>Accept Company Invite</h1>

      {!token ? (
        <>
          <p>Invite token is missing or invalid.</p>
          <Link to="/login">Go to login</Link>
        </>
      ) : (
        <>
          <p>Create a password for your company account.</p>

          {message && <p>{message}</p>}
          {error && <p>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {fieldErrors.password && <p>{fieldErrors.password}</p>}
            </div>

            <div>
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {fieldErrors.confirmPassword && (
                <p>{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {fieldErrors.token && <p>{fieldErrors.token}</p>}

            <button type="submit">Accept invite</button>
          </form>
        </>
      )}
    </main>
  );
}