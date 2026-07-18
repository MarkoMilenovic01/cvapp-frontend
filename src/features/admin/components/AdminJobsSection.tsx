import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";
import {
  AdminLoadingSpinner,
  AdminStatusToast,
} from "@/features/admin/components/AdminSectionUI";

import type {
  AdminJobResponse,
  PageResponse,
} from "@/types/admin";

const refreshButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function formatDeadline(value?: string | null) {
  if (!value) return "Nije naveden";

  return new Date(`${value}T00:00:00`).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getEmploymentTypeLabel(value?: string | null) {
  switch (value) {
    case "INTERNSHIP":
      return "Praksa";
    case "STUDENT_WORK":
      return "Studentski posao";
    case "PART_TIME":
      return "Part time";
    case "FULL_TIME":
      return "Full time";
    default:
      return "-";
  }
}

function getWorkModeLabel(value?: string | null) {
  switch (value) {
    case "ONSITE":
      return "U kancelariji";
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    default:
      return "-";
  }
}

export default function AdminJobsSection() {
  const [jobsPage, setJobsPage] =
    useState<PageResponse<AdminJobResponse> | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = useCallback(
    async (page = jobsPage?.number ?? 0, showSuccessMessage = false) => {
      try {
        setLoading(true);
        setError("");

        if (showSuccessMessage) {
          setMessage("");
        }

        const response = await adminApi.getAdminJobs(page);

        setJobsPage(response);

        if (showSuccessMessage) {
          setMessage("Oglasi su uspešno osveženi.");
        }
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Došlo je do greške prilikom učitavanja oglasa.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [jobsPage?.number],
  );

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleJob(id: number) {
    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      await adminApi.toggleJobActive(id);

      setMessage("Status oglasa je uspešno ažuriran.");
      await loadJobs();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom promene statusa oglasa.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteJob(id: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš ovaj oglas?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      await adminApi.deleteJob(id);

      setMessage("Oglas je uspešno obrisan.");
      await loadJobs();
    } catch (err) {
      setError(
        getErrorMessage(err, "Došlo je do greške prilikom brisanja oglasa."),
      );
    } finally {
      setDeletingId(null);
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
                Oglasi
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Upravljanje oglasima
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pregledaj oglase, promeni aktivnost oglasa ili obriši oglas sa
                platforme.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadJobs(jobsPage?.number ?? 0, true)}
            disabled={loading}
            className={refreshButtonClass}
          >
            {loading ? (
              <AdminLoadingSpinner />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? "Osvežavanje..." : "Osveži"}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <SectionTitle
          title="Lista oglasa"
          description={`Ukupno oglasa: ${
            jobsPage?.totalElements ?? jobsPage?.content.length ?? 0
          }`}
        />

        {loading && !jobsPage ? (
          <LoadingCard text="Učitavanje oglasa..." />
        ) : jobsPage?.content.length === 0 ? (
          <EmptyState text="Nema pronađenih oglasa." />
        ) : (
          <div className="space-y-4">
            {jobsPage?.content.map((job) => {
              const updating = updatingId === job.id;
              const deleting = deletingId === job.id;

              return (
                <article
                  key={job.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40"
                >
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#ffd21e]" />

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-950">
                          {job.title}
                        </h3>

                        <StatusBadge
                          active={job.active}
                          activeText="Aktivan"
                          inactiveText="Neaktivan"
                        />
                      </div>

                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Building2 className="h-4 w-4 text-[#1375bc]" />
                        {job.companyName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatValue(job.location)} ·{" "}
                        {getEmploymentTypeLabel(job.employmentType)} ·{" "}
                        {getWorkModeLabel(job.workMode)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleToggleJob(job.id)}
                        disabled={updating || deleting}
                        className={secondaryButtonClass}
                      >
                        {updating ? (
                          <AdminLoadingSpinner />
                        ) : job.active ? (
                          <Power className="h-4 w-4 text-[#1375bc]" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-[#1375bc]" />
                        )}
                        {updating
                          ? "Ažuriranje..."
                          : job.active
                            ? "Deaktiviraj"
                            : "Aktiviraj"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={updating || deleting}
                        className={dangerButtonClass}
                      >
                        {deleting ? (
                          <AdminLoadingSpinner />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        {deleting ? "Brisanje..." : "Obriši"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>ID: {job.id}</Badge>
                    <Badge>{getEmploymentTypeLabel(job.employmentType)}</Badge>
                    <Badge>{getWorkModeLabel(job.workMode)}</Badge>
                    <Badge>
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                      Rok: {formatDeadline(job.deadline)}
                    </Badge>
                    <Badge>Kreirano: {formatDate(job.createdAt)}</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {jobsPage && !jobsPage.empty && (
          <Pagination
            page={jobsPage.number}
            totalPages={jobsPage.totalPages}
            first={jobsPage.first}
            last={jobsPage.last}
            onPrevious={() => loadJobs(jobsPage.number - 1)}
            onNext={() => loadJobs(jobsPage.number + 1)}
          />
        )}
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

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
      <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function StatusBadge({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean;
  activeText: string;
  inactiveText: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function LoadingCard({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
      <span className="inline-flex items-center gap-2">
        <AdminLoadingSpinner />
        {text}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
      {text}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  first,
  last,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      <button
        type="button"
        disabled={first}
        onClick={onPrevious}
        className={secondaryButtonClass}
      >
        Prethodna
      </button>

      <p className="text-sm font-medium text-slate-500">
        Strana <span className="font-bold text-slate-900">{page + 1}</span> od{" "}
        <span className="font-bold text-slate-900">{totalPages}</span>
      </p>

      <button
        type="button"
        disabled={last}
        onClick={onNext}
        className={secondaryButtonClass}
      >
        Sledeća
      </button>
    </div>
  );
}
