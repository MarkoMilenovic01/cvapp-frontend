import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordFormProps = {
  token: string;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/;

function getPasswordError(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return `Lozinka mora imati između ${PASSWORD_MIN_LENGTH} i ${PASSWORD_MAX_LENGTH} karaktera.`;
  }
  if (!/[A-Z]/.test(password)) return "Lozinka mora sadržati bar jedno veliko slovo.";
  if (!/[0-9]/.test(password)) return "Lozinka mora sadržati bar jednu cifru.";
  if (!SPECIAL_CHAR_REGEX.test(password)) return "Lozinka mora sadržati bar jedan specijalni karakter.";
  return "";
}

function validateResetPasswordFields(
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = "Unesi novu lozinku.";
  } else {
    const passwordError = getPasswordError(password);
    if (passwordError) errors.password = passwordError;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Potvrdi novu lozinku.";
  } else if (password && password !== confirmPassword) {
    errors.confirmPassword = "Lozinke se ne poklapaju.";
  }

  return errors;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    if (!token) {
      setError(
        "Link za resetovanje lozinke nije validan ili je istekao. Zatraži novi link.",
      );
      return;
    }

    const validationErrors = validateResetPasswordFields(
      password,
      confirmPassword,
    );

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      await resetPassword({
        token,
        password,
        confirmPassword,
      });

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Došlo je do greške. Pokušaj ponovo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Nova lozinka</Label>

        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: "" }));
          }}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "password-error" : undefined
          }
        />

        {fieldErrors.password && (
          <p id="password-error" className="text-sm text-red-600">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potvrdi novu lozinku</Label>

        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
          }}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword ? "confirm-password-error" : undefined
          }
        />

        {fieldErrors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !token}
        className="h-12 w-full bg-gradient-to-r from-[#2f80ff] to-[#1e40e8] text-base font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
      >
        {isSubmitting ? "Postavljanje lozinke..." : "Postavi novu lozinku"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Setio/la si se lozinke?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#1375bc] transition hover:text-[#075486]"
        >
          Nazad na prijavu
        </Link>
      </p>
    </form>
  );
}
