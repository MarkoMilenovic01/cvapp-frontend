import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, LoaderCircle, Mail, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { ApiError } from "@/api/apiClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const EMAIL_MAX_LENGTH = 254;
const TOKEN_MAX_LENGTH = 36;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type VerifyEmailFormProps = {
  token: string;
  initialEmail: string;
};

export function VerifyEmailForm({ token, initialEmail }: VerifyEmailFormProps) {
  const { resendVerification, verifyEmail } = useAuth();
  const verificationStarted = useRef(false);
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">(
    token.length > TOKEN_MAX_LENGTH ? "error" : token ? "verifying" : "idle",
  );
  const [message, setMessage] = useState(
    token.length > TOKEN_MAX_LENGTH ? "Verifikacioni link nije validan." : "",
  );
  const [emailError, setEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token || token.length > TOKEN_MAX_LENGTH || verificationStarted.current) return;
    verificationStarted.current = true;

    verifyEmail({ token })
      .then(() => {
        setStatus("verified");
        setMessage("Email adresa je uspešno potvrđena. Sada možete da se prijavite.");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Link nije validan ili je istekao. Zatražite novu poruku.",
        );
      });
  }, [token, verifyEmail]);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("Email adresa je obavezna");
      return;
    }
    if (normalizedEmail.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(normalizedEmail)) {
      setEmailError("Unesite ispravnu email adresu");
      return;
    }

    setEmailError("");
    setMessage("");
    setIsResending(true);
    try {
      await resendVerification({ email: normalizedEmail });
      setStatus("idle");
      setMessage("Ako nalog čeka verifikaciju, poslali smo novu poruku na vaš email.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof ApiError ? error.message : "Slanje nije uspelo. Pokušajte ponovo.");
    } finally {
      setIsResending(false);
    }
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center py-5 text-center" role="status">
        <LoaderCircle className="h-10 w-10 animate-spin text-[#1375bc]" />
        <p className="mt-4 font-semibold text-slate-900">Potvrđujemo email adresu...</p>
        <p className="mt-1 text-sm text-slate-500">Ovo traje samo trenutak.</p>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#1375bc] text-sm font-semibold text-white transition hover:bg-[#075486]"
        >
          Nastavite na prijavu
        </Link>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <Alert variant={status === "error" ? "destructive" : "default"} className="mb-5">
          {status === "error" ? <XCircle /> : <Mail />}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-5" onSubmit={handleResend} noValidate>
        <div className="space-y-2">
          <Label htmlFor="verification-email">Email adresa</Label>
          <Input
            id="verification-email"
            type="email"
            value={email}
            autoComplete="email"
            maxLength={EMAIL_MAX_LENGTH}
            placeholder="ime@primer.com"
            aria-invalid={Boolean(emailError)}
            onChange={(event) => {
              setEmail(event.target.value);
              setEmailError("");
            }}
          />
          {emailError && <p className="text-sm text-destructive">{emailError}</p>}
        </div>

        <Button
          type="submit"
          disabled={isResending}
          className="h-12 w-full bg-gradient-to-r from-[#2f80ff] to-[#1e40e8] text-base font-semibold text-white"
        >
          {isResending ? "Slanje..." : "Pošaljite ponovo"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Već ste potvrdili email?{" "}
        <Link to="/login" className="font-semibold text-[#1375bc] hover:underline">Prijavite se</Link>
      </p>
    </div>
  );
}
