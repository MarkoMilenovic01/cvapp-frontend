import { useState } from "react";
import type * as React from "react";
import { CircleAlert, RotateCcw, Send } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";
import {
  AdminLoadingSpinner,
  AdminStatusToast,
} from "@/features/admin/components/AdminSectionUI";

type InviteErrors = Partial<Record<"email" | "companyName", string>>;

function validateInvite(email: string, companyName: string) {
  const errors: InviteErrors = {};

  if (!email.trim()) {
    errors.email = "Email je obavezan.";
  } else if (email.length > 254) {
    errors.email = "Email može imati najviše 254 karaktera.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Unesi validnu email adresu.";
  }

  if (!companyName.trim()) {
    errors.companyName = "Naziv kompanije je obavezan.";
  } else if (companyName.length > 120) {
    errors.companyName = "Naziv kompanije može imati najviše 120 karaktera.";
  }

  return errors;
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

export default function AdminInvitesSection() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompanyName, setInviteCompanyName] = useState("");

  const [sendingInvite, setSendingInvite] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<InviteErrors>({});

  async function handleSendInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateInvite(inviteEmail, inviteCompanyName);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("");
      setError("Proveri označena polja pre slanja pozivnice.");
      return;
    }

    try {
      setSendingInvite(true);
      setMessage("");
      setError("");

      await adminApi.sendCompanyInvite({
        email: inviteEmail.trim(),
        companyName: inviteCompanyName.trim(),
      });

      setInviteEmail("");
      setInviteCompanyName("");
      setValidationErrors({});
      setMessage("Pozivnica za kompaniju je uspešno poslata.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom slanja pozivnice.",
        ),
      );
    } finally {
      setSendingInvite(false);
    }
  }

  function handleClearForm() {
    setInviteEmail("");
    setInviteCompanyName("");
    setMessage("");
    setError("");
    setValidationErrors({});
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
              Pozivnice
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
              Pozovi kompaniju
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
              Pošalji email pozivnicu kompaniji kako bi mogla da kreira nalog i
              pristupi kompanijskom dashboardu.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleSendInvite}
            noValidate
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-6">
              <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                Company invite
              </p>

              <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                Nova pozivnica
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Unesi email adresu kompanije i naziv kompanije. Nakon toga
                kompanija dobija pozivnicu za registraciju.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email kompanije" error={validationErrors.email}>
                <input
                  type="email"
                  value={inviteEmail}
                  placeholder="company@example.com"
                  maxLength={255}
                  aria-invalid={Boolean(validationErrors.email)}
                  onChange={(event) => {
                    setValidationErrors((current) => ({
                      ...current,
                      email: undefined,
                    }));
                    setError("");
                    setInviteEmail(event.target.value);
                  }}
                  disabled={sendingInvite}
                  className={`${inputClass} ${validationErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
              </Field>

              <Field
                label="Naziv kompanije"
                error={validationErrors.companyName}
              >
                <input
                  value={inviteCompanyName}
                  placeholder="BEST Niš"
                  maxLength={121}
                  aria-invalid={Boolean(validationErrors.companyName)}
                  onChange={(event) => {
                    setValidationErrors((current) => ({
                      ...current,
                      companyName: undefined,
                    }));
                    setError("");
                    setInviteCompanyName(event.target.value)
                  }}
                  disabled={sendingInvite}
                  className={`${inputClass} ${validationErrors.companyName ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
              </Field>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={sendingInvite}
                className={primaryButtonClass}
              >
                {sendingInvite ? (
                  <AdminLoadingSpinner />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {sendingInvite ? "Slanje pozivnice..." : "Pošalji pozivnicu"}
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                disabled={sendingInvite}
                className={secondaryButtonClass}
              >
                <RotateCcw className="h-4 w-4 text-[#1375bc]" />
                Očisti formu
              </button>
            </div>
          </form>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                Pregled
              </p>

              <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                Podaci pozivnice
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ovako će izgledati osnovni podaci koje šalješ backendu.
              </p>

              <div className="mt-5 space-y-3">
                <PreviewItem
                  label="Email"
                  value={inviteEmail.trim() || "Nije unet email"}
                />

                <PreviewItem
                  label="Kompanija"
                  value={inviteCompanyName.trim() || "Nije unet naziv"}
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#ffd21e]/40 bg-[#fff8d8] px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  Napomena
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Pozivnicu šalji samo kompanijama koje treba da imaju pristup
                  kompanijskom delu aplikacije.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AdminStatusToast
        message={message}
        error={error}
        onClose={() => {
          setMessage("");
          setError("");
        }}
      />
    </section>
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
      {error && (
        <span className="flex items-start gap-1.5 text-xs font-medium text-red-600">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </span>
      )}
    </label>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
