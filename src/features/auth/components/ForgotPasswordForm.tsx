import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ApiError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";

const EMAIL_MAX_LENGTH = 254;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForgotPasswordFields(email: string) {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = "Email adresa je obavezna";
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = `Email adresa može imati najviše ${EMAIL_MAX_LENGTH} karaktera`;
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Neispravan format email adrese";
  }

  return errors;
}

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const validationErrors = validateForgotPasswordFields(email);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ email: email.trim() });

      setSuccessMessage(
        "Ako ovaj email postoji, poslate su instrukcije za resetovanje lozinke.",
      );
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

  function handleEmailChange(value: string) {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertDescription>{successMessage}</AlertDescription>
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-gradient-to-r from-[#2f80ff] to-[#1e40e8] text-base font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
        >
          {isSubmitting ? "Slanje..." : "Pošaljite link za reset"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center text-sm text-slate-500">
        <Link
          to="/login"
          className="font-medium text-[#1375bc] hover:underline"
        >
          Nazad na prijavu
        </Link>
      </div>
    </div>
  );
}
