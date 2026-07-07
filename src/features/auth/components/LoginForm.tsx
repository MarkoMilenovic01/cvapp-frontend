import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { ApiError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRedirect";
import { getOAuthErrorMessage } from "@/utils/oauthErrors";
import { GoogleButton } from "@/features/auth/components/GoogleButton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 128;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginFields(email: string, password: string) {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = "Email adresa je obavezna";
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = `Email adresa može imati najviše ${EMAIL_MAX_LENGTH} karaktera`;
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Neispravan format email adrese";
  }

  if (!password) {
    errors.password = "Lozinka je obavezna";
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Lozinka može imati najviše ${PASSWORD_MAX_LENGTH} karaktera`;
  }

  return errors;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oauthError = getOAuthErrorMessage(searchParams.get("oauthError"));
  const pageError = error || oauthError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const validationErrors = validateLoginFields(email, password);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      navigate(getDashboardPath(response.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Došlo je do greške. Pokušajte ponovo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    if (!API_BASE_URL) {
      setError("Osnovni API URL nije podešen.");
      return;
    }

    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  }

  return (
    <div>
      {pageError && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email adresa</Label>

          <Input
            id="email"
            type="email"
            value={email}
            placeholder="Email adresa"
            autoComplete="email"
            maxLength={EMAIL_MAX_LENGTH}
            onChange={(event) => handleEmailChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
          />

          {fieldErrors.email && (
            <p className="text-sm text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Lozinka</Label>

          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Lozinka"
            autoComplete="current-password"
            maxLength={PASSWORD_MAX_LENGTH}
            onChange={(event) => handlePasswordChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />

          {fieldErrors.password && (
            <p className="text-sm text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-gradient-to-r from-[#2f80ff] to-[#1e40e8] text-base font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
        >
          {isSubmitting ? "Prijavljivanje..." : "Prijavite se"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          ili
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton onClick={handleGoogleLogin} />

      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
        <Link
          to="/forgot-password"
          className="font-medium text-[#1375bc] hover:underline"
        >
          Zaboravili ste lozinku?
        </Link>

        <span>•</span>

        <Link
          to="/register"
          className="font-medium text-[#1375bc] hover:underline"
        >
          Registracija
        </Link>
      </div>
    </div>
  );
}