import { useState } from "react";
import type * as React from "react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#1375bc] px-4 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#1375bc]/30 hover:bg-[#f3f8fc] hover:text-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

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

  async function handleSendInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleSendInvite}
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
              <Field label="Email kompanije">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  placeholder="company@example.com"
                  onChange={(event) => setInviteEmail(event.target.value)}
                  disabled={sendingInvite}
                  className={inputClass}
                />
              </Field>

              <Field label="Naziv kompanije">
                <input
                  required
                  value={inviteCompanyName}
                  placeholder="BEST Niš"
                  onChange={(event) =>
                    setInviteCompanyName(event.target.value)
                  }
                  disabled={sendingInvite}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={sendingInvite}
                className={primaryButtonClass}
              >
                {sendingInvite ? "Slanje pozivnice..." : "Pošalji pozivnicu"}
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                disabled={sendingInvite}
                className={secondaryButtonClass}
              >
                Očisti formu
              </button>
            </div>
          </form>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
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