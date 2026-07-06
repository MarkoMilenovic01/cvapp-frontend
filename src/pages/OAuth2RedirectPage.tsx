import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/authRedirect";
import { ApiError } from "../api/apiClient";

export default function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get("code");

    if (!code) {
      navigate("/login?oauthError=oauth_failed", { replace: true });
      return;
    }

    completeOAuthLogin({ code })
      .then((response) => {
        navigate(getDashboardPath(response.role), { replace: true });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Google login failed");
      });
  }, [searchParams, completeOAuthLogin, navigate]);

  return (
    <main>
      {error ? (
        <>
          <p>{error}</p>
          <p>
            <Link to="/login">Back to login</Link>
          </p>
        </>
      ) : (
        <p>Signing you in…</p>
      )}
    </main>
  );
}