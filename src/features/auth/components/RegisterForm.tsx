import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { ApiError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRedirect";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the checks in PasswordValidator on the backend so users get
// instant feedback instead of a round trip to the server.
function getPasswordRequirements(password: string) {
  return {
    length:
      password.length >= PASSWORD_MIN_LENGTH &&
      password.length <= PASSWORD_MAX_LENGTH,
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    special: SPECIAL_CHAR_REGEX.test(password),
  };
}

function getPasswordError(password: string) {
  const requirements = getPasswordRequirements(password);

  if (!requirements.length) {
    return `Lozinka mora imati između ${PASSWORD_MIN_LENGTH} i ${PASSWORD_MAX_LENGTH} karaktera`;
  }
  if (!requirements.uppercase) {
    return "Lozinka mora sadržati bar jedno veliko slovo";
  }
  if (!requirements.digit) {
    return "Lozinka mora sadržati bar jednu cifru";
  }
  if (!requirements.special) {
    return "Lozinka mora sadržati bar jedan specijalni karakter";
  }
  return "";
}

function validateRegisterFields(
  email: string,
  password: string,
  confirmPassword: string,
) {
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
  } else {
    const passwordError = getPasswordError(password);
    if (passwordError) {
      errors.password = passwordError;
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Potvrda lozinke je obavezna";
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = "Lozinke se ne podudaraju";
  }

  return errors;
}

const PASSWORD_RULES: Array<{
  key: keyof ReturnType<typeof getPasswordRequirements>;
  label: string;
}> = [
  { key: "length", label: `${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} karaktera` },
  { key: "uppercase", label: "Jedno veliko slovo" },
  { key: "digit", label: "Jedna cifra" },
  { key: "special", label: "Jedan specijalni karakter" },
];

function PasswordRequirements({ password }: { password: string }) {
  const requirements = useMemo(
    () => getPasswordRequirements(password),
    [password],
  );

  return (
    <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
      {PASSWORD_RULES.map((rule) => {
        const met = requirements[rule.key];

        return (
          <li
            key={rule.key}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              met ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {met ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const validationErrors = validateRegisterFields(
      email,
      password,
      confirmPassword,
    );
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const resp = await register({
        email: email.trim(),
        password,
        confirmPassword,
      });

      setSuccessMessage(resp.message ?? "Uspešna registracija. Proverite email.");
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`, {
        replace: true,
      });
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

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      setError("Google prijava nije uspela.");
      return;
    }

    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      navigate(getDashboardPath(response.role), { replace: true });
    } catch {
      setError("Došlo je do greške prilikom Google prijave.");
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
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordTouched(true);
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
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
        <Alert variant="default" className="mb-5">
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

        <div className="space-y-2">
          <Label htmlFor="password">Lozinka</Label>

          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Lozinka"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            onChange={(event) => handlePasswordChange(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
          />

          {fieldErrors.password ? (
            <p className="text-sm text-destructive">{fieldErrors.password}</p>
          ) : (
            passwordTouched && <PasswordRequirements password={password} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>

          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            placeholder="Potvrdite lozinku"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            onChange={(event) =>
              handleConfirmPasswordChange(event.target.value)
            }
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />

          {fieldErrors.confirmPassword && (
            <p className="text-sm text-destructive">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-gradient-to-r from-[#2f80ff] to-[#1e40e8] text-base font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95"
        >
          {isSubmitting ? "Registracija..." : "Registrujte se"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          ili
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => setError("Google prijava nije uspela.")}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />

      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
        <span>Već imate nalog?</span>

        <Link
          to="/login"
          className="font-medium text-[#1375bc] hover:underline"
        >
          Prijavite se
        </Link>
      </div>
    </div>
  );
}
