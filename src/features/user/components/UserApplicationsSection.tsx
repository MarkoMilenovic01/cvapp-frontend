import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/apiClient";
import * as jobApi from "@/api/jobApi";

import type { ApplicationStatus, JobApplicationResponse } from "@/types/job";

const dangerButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

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

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setError("");

      const response = await jobApi.getMyApplications();
      setApplications(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja prijava.",
        ),
      );
    } finally {
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleWithdraw(applicationId: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da povučeš ovu prijavu?",
    );

    if (!confirmed) return;

    try {
      setWithdrawingId(applicationId);
      setMessage("");
      setError("");

      await jobApi.withdrawApplication(applicationId);

      setMessage("Prijava je uspešno povučena.");
      await loadApplications();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom povlačenja prijave.",
        ),
      );
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

        {applications.length === 0 ? (
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
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                        {application.jobTitle}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-600">
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

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <InfoItem
                      label="CV"
                      value={`${application.cvFirstName} ${application.cvLastName}`}
                    />

                    <InfoItem
                      label="Datum prijave"
                      value={formatDate(application.appliedAt)}
                    />

                    <InfoItem
                      label="Status"
                      value={getStatusLabel(application.status)}
                    />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={!withdrawAllowed || isWithdrawing}
                      onClick={() => handleWithdraw(application.id)}
                      className={dangerButtonClass}
                    >
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
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}