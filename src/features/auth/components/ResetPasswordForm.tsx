import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "@/api/apiClient";
import { resetPassword } from "@/api/authApi";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordFormProps = {
  token: string;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

function validateResetPasswordFields(
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = "Unesi novu lozinku.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Lozinka mora imati najmanje ${PASSWORD_MIN_LENGTH} karaktera.`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Lozinka ne sme imati više od ${PASSWORD_MAX_LENGTH} karaktera.`;
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
    <form onSubmit={handleSubmit} className="space-y-5">
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
          onChange={(event) => setPassword(event.target.value)}
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
          onChange={(event) => setConfirmPassword(event.target.value)}
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
  disabled={isSubmitting}
  className="h-11 w-full rounded-xl bg-[#1375bc] font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60"
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