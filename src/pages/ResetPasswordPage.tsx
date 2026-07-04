import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/apiClient";
import { resetPassword } from "../api/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    try {
      await resetPassword({ token, password, confirmPassword });
      navigate("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Something went wrong");
      }
    }
  }

  return (
    <main>
      <h1>Reset password</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>New password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {fieldErrors.password && <p>{fieldErrors.password}</p>}
        </div>

        <div>
          <label>Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {fieldErrors.confirmPassword && <p>{fieldErrors.confirmPassword}</p>}
        </div>

        {error && <p>{error}</p>}

        <button type="submit">Reset password</button>
      </form>

      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  );
}