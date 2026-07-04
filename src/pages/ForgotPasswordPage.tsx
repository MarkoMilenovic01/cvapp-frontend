import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/apiClient";
import { forgotPassword } from "../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFieldErrors({});
    setSuccessMessage("");

    try {
      await forgotPassword({ email });
      setSuccessMessage("If this email exists, password reset instructions were sent.");
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
      <h1>Forgot password</h1>

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

        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p>}

        <button type="submit">Send reset link</button>
      </form>

      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  );
}