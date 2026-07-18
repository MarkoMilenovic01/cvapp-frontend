import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as jobApi from "@/api/jobApi";

import type { ApplicationStatus, JobApplicationResponse } from "@/types/job";

type Status = { type: "success" | "error"; message: string } | null;

const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function canWithdraw(status: ApplicationStatus) {
  return !["WITHDRAWN", "REJECTED", "ACCEPTED"].includes(status);
}

function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "APPLIED":
      return "Poslata";
    case "REVIEWED":
      return "Pregledana";
    case "SHORTLISTED":
      return "U užem izboru";
    case "CONTACTED":
      return "Kontaktiran/a";
    case "REJECTED":
      return "Odbijena";
    case "ACCEPTED":
      return "Prihvaćena";
    case "WITHDRAWN":
      return "Povučena";
    default:
      return status;
  }
}

function getStatusClass(status: ApplicationStatus) {
  switch (status) {
    case "ACCEPTED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";
    case "WITHDRAWN":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "SHORTLISTED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CONTACTED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "REVIEWED":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "APPLIED":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function UserApplicationsSection() {
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    [],
  );

  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!status) return;

    const timeout = window.setTimeout(() => setStatus(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await jobApi.getMyApplications();
      setApplications(response);
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja prijava.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadApplications();
  }, [loadApplications]);

  async function handleWithdraw(applicationId: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da povučeš ovu prijavu?",
    );

    if (!confirmed) return;

    try {
      setWithdrawingId(applicationId);
      setStatus(null);

      await jobApi.withdrawApplication(applicationId);

      setStatus({
        type: "success",
        message: "Prijava je uspešno povučena.",
      });
      await loadApplications();
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          "Došlo je do greške prilikom povlačenja prijave.",
        ),
      });
    } finally {
      setWithdrawingId(null);
    }
  }


  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                Moje prijave
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Status prijava
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pregledaj pozicije na koje si se prijavio i prati njihov status.
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner />
              Učitavanje prijava...
            </span>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <h3 className="text-lg font-bold text-slate-950">
              Još nemaš poslatih prijava.
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Kada se prijaviš na neku praksu ili posao, prijava će se pojaviti
              ovde.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => {
              const withdrawAllowed = canWithdraw(application.status);
              const isWithdrawing = withdrawingId === application.id;

              return (
                <article
                  key={application.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40"
                >
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#ffd21e]" />

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        {application.jobTitle}
                      </h3>

                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Building2 className="h-4 w-4 text-[#1375bc]" />
                        {application.companyName}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold",
                        getStatusClass(application.status),
                      ].join(" ")}
                    >
                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <MetaBadge>
                      CV: {application.cvFirstName} {application.cvLastName}
                    </MetaBadge>

                    <MetaBadge>
                      <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                      Prijavljeno: {formatDate(application.appliedAt)}
                    </MetaBadge>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={!withdrawAllowed || isWithdrawing}
                      onClick={() => handleWithdraw(application.id)}
                      className={dangerButtonClass}
                    >
                      {isWithdrawing ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isWithdrawing ? "Povlačenje..." : "Povuci prijavu"}
                    </button>

                    {!withdrawAllowed && (
                      <p className="flex items-center text-sm text-slate-500">
                        Ova prijava više ne može da se povuče.
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <StatusToast status={status} onClose={() => setStatus(null)} />
    </section>
  );
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function LoadingSpinner() {
  return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
}

function StatusToast({
  status,
  onClose,
}: {
  status: Status;
  onClose: () => void;
}) {
  if (!status) return null;

  const success = status.type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      aria-live={success ? "polite" : "assertive"}
      className={[
        "fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl",
        success ? "border-emerald-200" : "border-red-200",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          success
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600",
        ].join(" ")}
      >
        {success ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <CircleAlert className="h-5 w-5" />
        )}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-slate-900">
          {success ? "Uspešno" : "Došlo je do greške"}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          {status.message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Zatvori obaveštenje"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
