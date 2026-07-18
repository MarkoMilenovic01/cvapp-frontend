import { useState } from "react";
import type { ComponentProps } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import jobFairLogoWhite from "@/assets/jobfairnis-white.svg";
import bestLogoWhite from "@/assets/bestnis-white.svg";

import { ApiError } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPath } from "@/utils/authRedirect";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1375bc] px-4 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryLinkClass =
  "inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#1375bc]/30 hover:bg-[#f3f8fc] hover:text-[#075486]";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/;

function validatePasswords(password: string, confirmPassword: string) {
  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = "Lozinka je obavezna.";
  } else if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    errors.password = `Lozinka mora imati između ${PASSWORD_MIN_LENGTH} i ${PASSWORD_MAX_LENGTH} karaktera.`;
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Lozinka mora sadržati bar jedno veliko slovo.";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Lozinka mora sadržati bar jednu cifru.";
  } else if (!SPECIAL_CHAR_REGEX.test(password)) {
    errors.password = "Lozinka mora sadržati bar jedan specijalni karakter.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Potvrda lozinke je obavezna.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Lozinke se ne poklapaju.";
  }

  return errors;
}

export default function AcceptCompanyInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { acceptCompanyInvite } = useAuth();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setFieldErrors({});

    if (!token) {
      setError("Token pozivnice nedostaje.");
      return;
    }

    const validationErrors = validatePasswords(password, confirmPassword);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const response = await acceptCompanyInvite({
        token,
        password,
        confirmPassword,
      });

      setMessage("Pozivnica je uspešno prihvaćena.");

      navigate(getDashboardPath(response.role), {
        replace: true,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.details ?? {});
      } else {
        setError("Došlo je do greške prilikom prihvatanja pozivnice.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#075486] text-slate-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(19,117,188,0.42),transparent_30%),linear-gradient(135deg,#1375bc_0%,#075486_48%,#02253d_100%)]"
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center gap-6">
          <img
            src={jobFairLogoWhite}
            alt="Job Fair Internship"
            className="h-9 w-auto"
          />

          <div className="hidden h-8 w-px bg-white/20 sm:block" />

          <img src={bestLogoWhite} alt="BEST Niš" className="h-9 w-auto" />
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="max-w-2xl text-white">
            <div className="mb-5 h-1 w-20 rounded-full bg-[#f7c51e]" />

            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-white/55">
              Company onboarding
            </p>

            <h1 className="mt-4 font-['Space_Grotesk',sans-serif] text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
              Aktiviraj kompanijski nalog
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Kreiraj lozinku za kompanijski nalog i pristupi dashboardu za
              upravljanje profilom, oglasima i prijavama kandidata.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">
            {!token ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-2xl font-bold text-red-600">
                  !
                </div>

                <h2 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                  Pozivnica nije validna
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Token pozivnice nedostaje ili link koji si otvorio nije
                  ispravan.
                </p>

                <Link to="/login" className={`${secondaryLinkClass} mt-6`}>
                  Idi na prijavu
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <div className="h-1 w-12 rounded-full bg-[#ffd21e]" />

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                    Prihvatanje pozivnice
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                    Kreiraj lozinku
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Unesi lozinku koju će kompanija koristiti za pristup
                    platformi.
                  </p>
                </div>

                {message && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <Field
                    label="Lozinka"
                    error={fieldErrors.password}
                  >
                    <input
                      type="password"
                      value={password}
                      placeholder="Unesi lozinku"
                      autoComplete="new-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldErrors((current) => ({
                          ...current,
                          password: "",
                        }));
                      }}
                      disabled={submitting}
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Potvrdi lozinku"
                    error={fieldErrors.confirmPassword}
                  >
                    <input
                      type="password"
                      value={confirmPassword}
                      placeholder="Ponovi lozinku"
                      autoComplete="new-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setFieldErrors((current) => ({
                          ...current,
                          confirmPassword: "",
                        }));
                      }}
                      disabled={submitting}
                      className={inputClass}
                    />
                  </Field>

                  {fieldErrors.token && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {fieldErrors.token}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={primaryButtonClass}
                  >
                    {submitting ? "Prihvatanje pozivnice..." : "Prihvati pozivnicu"}
                  </button>

                  <Link to="/login" className={secondaryLinkClass}>
                    Već imaš nalog? Prijavi se
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      {children}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </label>
  );
}
