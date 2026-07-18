import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  MapPin,
  Search,
  Send,
  X,
} from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as jobApi from "@/api/jobApi";

import type {
  JobApplicationResponse,
  JobResponse,
  JobSearchFilter,
  PageResponse,
} from "@/types/job";

const emptyFilter: JobSearchFilter = {
  keyword: "",
  location: "",
  employmentType: "",
  workMode: "",
  companyName: "",
};

type FilterErrors = Partial<Record<"keyword" | "location" | "companyName", string>>;
type Status = { type: "success" | "error"; message: string } | null;

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const subtleButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-[#1375bc] transition hover:bg-[#1375bc]/10 hover:text-[#075486]";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

function hasActiveFilter(filter: JobSearchFilter) {
  return Boolean(
    filter.keyword.trim() ||
      filter.location.trim() ||
      filter.employmentType ||
      filter.workMode ||
      filter.companyName.trim(),
  );
}

function validateFilter(filter: JobSearchFilter) {
  const errors: FilterErrors = {};

  if (filter.keyword.trim().length > 200) {
    errors.keyword = "Ključna reč može imati najviše 200 karaktera.";
  }

  if (filter.location.trim().length > 255) {
    errors.location = "Lokacija može imati najviše 255 karaktera.";
  }

  if (filter.companyName.trim().length > 255) {
    errors.companyName = "Naziv kompanije može imati najviše 255 karaktera.";
  }

  return errors;
}

function cleanFilter(filter: JobSearchFilter): JobSearchFilter {
  return {
    ...filter,
    keyword: filter.keyword.trim(),
    location: filter.location.trim(),
    companyName: filter.companyName.trim(),
  };
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function formatDate(value?: string | null) {
  if (!value) return "Nije naveden";

  return new Date(`${value}T00:00:00`).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getEmploymentTypeLabel(value: JobResponse["employmentType"]) {
  const labels = {
    INTERNSHIP: "Praksa",
    STUDENT_WORK: "Studentski posao",
    PART_TIME: "Nepuno radno vreme",
    FULL_TIME: "Puno radno vreme",
  };

  return labels[value];
}

function getWorkModeLabel(value: JobResponse["workMode"]) {
  const labels = {
    ONSITE: "U kancelariji",
    REMOTE: "Rad na daljinu",
    HYBRID: "Hibridno",
  };

  return labels[value];
}

export default function UserJobsSection() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<JobSearchFilter>(emptyFilter);
  const [activeFilter, setActiveFilter] =
    useState<JobSearchFilter>(emptyFilter);
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({});
  const [page, setPage] = useState(0);

  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null,
  );

  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState<number | null>(null);

  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    if (!status) return;

    const timeout = window.setTimeout(() => setStatus(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function loadJobs(
    nextPage = page,
    nextFilter: JobSearchFilter = filter,
  ) {
    try {
      setLoading(true);
      setStatus(null);

      const response = hasActiveFilter(nextFilter)
        ? await jobApi.searchJobs(nextFilter, nextPage)
        : await jobApi.getAllActiveJobs(nextPage);

      setJobPage(response);
      setPage(response.number);
      setActiveFilter(nextFilter);
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja pozicija.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      setApplicationsLoading(true);
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
      setApplicationsLoading(false);
    }
  }

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJobs(0, emptyFilter);
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateFilter(filter);
    setFilterErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus({
        type: "error",
        message: "Proveri označena polja za pretragu.",
      });
      return;
    }

    const cleanedFilter = cleanFilter(filter);
    setFilter(cleanedFilter);
    setSelectedJob(null);

    await loadJobs(0, cleanedFilter);
  }

  async function handleClearSearch() {
    setFilter(emptyFilter);
    setFilterErrors({});
    setSelectedJob(null);

    await loadJobs(0, emptyFilter);
  }

  async function handleViewJob(id: number) {
    try {
      setDetailsLoading(true);
      setStatus(null);
      setSelectedJob(null);

      const response = await jobApi.getActiveJobById(id);
      setSelectedJob(response);
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja detalja.",
        ),
      });
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleApply(jobId: number) {
    try {
      setIsApplying(jobId);
      setStatus(null);

      await jobApi.applyToJob(jobId);

      setStatus({ type: "success", message: "Prijava je uspešno poslata." });
      await loadApplications();
    } catch (err) {
      setStatus({
        type: "error",
        message: getErrorMessage(
          err,
          "Došlo je do greške prilikom slanja prijave.",
        ),
      });
    } finally {
      setIsApplying(null);
    }
  }

  function hasApplied(jobId: number) {
    return applications.some(
      (application) =>
        application.jobId === jobId && application.status !== "WITHDRAWN",
    );
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                  Prakse i poslovi
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                  Otvorene pozicije
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                  Pretraži pozicije, pogledaj detalje kompanije i prijavi se
                  direktno preko platforme.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <form
            onSubmit={handleSearch}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-5">
              <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
              <h3 className="text-lg font-bold text-slate-950">Pretraga</h3>

              <p className="mt-1 text-sm text-slate-500">
                Filtriraj pozicije po tehnologiji, lokaciji, tipu angažovanja i
                načinu rada.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Ključna reč" error={filterErrors.keyword}>
                <input
                  value={filter.keyword}
                  placeholder="Backend, Java, React..."
                  maxLength={201}
                  aria-invalid={Boolean(filterErrors.keyword)}
                  onChange={(event) => {
                    setFilterErrors((current) => ({
                      ...current,
                      keyword: undefined,
                    }));
                    setFilter((current) => ({
                      ...current,
                      keyword: event.target.value,
                    }));
                  }}
                  className={inputClass}
                />
              </Field>

              <Field label="Lokacija" error={filterErrors.location}>
                <input
                  value={filter.location}
                  placeholder="Niš, Beograd, Remote..."
                  maxLength={256}
                  aria-invalid={Boolean(filterErrors.location)}
                  onChange={(event) => {
                    setFilterErrors((current) => ({
                      ...current,
                      location: undefined,
                    }));
                    setFilter((current) => ({
                      ...current,
                      location: event.target.value,
                    }));
                  }}
                  className={inputClass}
                />
              </Field>

              <Field label="Kompanija" error={filterErrors.companyName}>
                <input
                  value={filter.companyName}
                  placeholder="Naziv kompanije"
                  maxLength={256}
                  aria-invalid={Boolean(filterErrors.companyName)}
                  onChange={(event) => {
                    setFilterErrors((current) => ({
                      ...current,
                      companyName: undefined,
                    }));
                    setFilter((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }));
                  }}
                  className={inputClass}
                />
              </Field>

              <Field label="Tip angažovanja">
                <select
                  value={filter.employmentType}
                  onChange={(event) =>
                    setFilter((current) => ({
                      ...current,
                      employmentType:
                        event.target.value as JobSearchFilter["employmentType"],
                    }))
                  }
                  className={selectClass}
                >
                  <option value="">Bilo koji</option>
                  <option value="INTERNSHIP">Praksa</option>
                  <option value="STUDENT_WORK">Studentski posao</option>
                  <option value="PART_TIME">Part time</option>
                  <option value="FULL_TIME">Full time</option>
                </select>
              </Field>

              <Field label="Način rada">
                <select
                  value={filter.workMode}
                  onChange={(event) =>
                    setFilter((current) => ({
                      ...current,
                      workMode:
                        event.target.value as JobSearchFilter["workMode"],
                    }))
                  }
                  className={selectClass}
                >
                  <option value="">Bilo koji</option>
                  <option value="ONSITE">U kancelariji</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className={`${primaryButtonClass} gap-2`}
              >
                {loading ? <LoadingSpinner /> : <Search className="h-4 w-4" />}
                Pretraži pozicije
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleClearSearch}
                className={secondaryButtonClass}
              >
                Očisti filtere
              </button>
            </div>
          </form>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
                  <h3 className="text-xl font-bold text-slate-950">
                    Dostupne pozicije
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {jobPage
                      ? `Pronađeno: ${
                          jobPage.totalElements ?? jobPage.content.length
                        }`
                      : "Pregled otvorenih pozicija"}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner />
                    Učitavanje pozicija...
                  </span>
                </div>
              ) : (
                <>
                  {jobPage?.content.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <p className="font-semibold text-slate-700">
                        Nema pronađenih pozicija.
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Probaj da promeniš filtere ili očisti pretragu.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {jobPage?.content.map((job) => {
                      const applied = hasApplied(job.id);
                      const selected = selectedJob?.id === job.id;

                      return (
                        <article
                          key={job.id}
                          className={[
                            "rounded-3xl border bg-white p-5 shadow-sm transition",
                            selected
                              ? "border-[#1375bc] ring-4 ring-[#1375bc]/10"
                              : "border-slate-200 hover:border-[#1375bc]/40",
                          ].join(" ")}
                        >
                          <div className="mb-4 h-1 w-9 rounded-full bg-[#ffd21e]" />

                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-slate-950">
                                {job.title}
                              </h4>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                                  <Building2 className="h-4 w-4 text-[#1375bc]" />
                                  {job.companyName}
                                </span>

                                <span>•</span>

                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {formatValue(job.location)}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/companies/${job.companyId}`)
                              }
                              className={subtleButtonClass}
                            >
                              Profil kompanije
                            </button>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge>{getEmploymentTypeLabel(job.employmentType)}</Badge>
                            <Badge>{getWorkModeLabel(job.workMode)}</Badge>
                            <Badge>
                              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                              Rok: {formatDate(job.deadline)}
                            </Badge>
                          </div>

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => handleViewJob(job.id)}
                              className={secondaryButtonClass}
                            >
                              Pogledaj detalje
                            </button>

                            <button
                              type="button"
                              disabled={
                                applied ||
                                applicationsLoading ||
                                isApplying === job.id
                              }
                              onClick={() => handleApply(job.id)}
                              className={`${primaryButtonClass} gap-2`}
                            >
                              {isApplying === job.id && <LoadingSpinner />}
                              {!applied && isApplying !== job.id && (
                                <Send className="h-4 w-4" />
                              )}
                              {applied
                                ? "Već si prijavljen/a"
                                : applicationsLoading
                                  ? "Provera prijave..."
                                : isApplying === job.id
                                  ? "Slanje prijave..."
                                  : "Prijavi se"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {jobPage && !jobPage.empty && (
                    <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                      <button
                        type="button"
                        disabled={jobPage.first}
                        onClick={() => loadJobs(page - 1, activeFilter)}
                        className={secondaryButtonClass}
                      >
                        Prethodna
                      </button>

                      <p className="text-sm font-medium text-slate-500">
                        Strana{" "}
                        <span className="font-bold text-slate-900">
                          {jobPage.number + 1}
                        </span>{" "}
                        od{" "}
                        <span className="font-bold text-slate-900">
                          {jobPage.totalPages}
                        </span>
                      </p>

                      <button
                        type="button"
                        disabled={jobPage.last}
                        onClick={() => loadJobs(page + 1, activeFilter)}
                        className={secondaryButtonClass}
                      >
                        Sledeća
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1375bc]">
                  Detalji pozicije
                </p>

                {detailsLoading && (
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                    <LoadingSpinner />
                    Učitavanje detalja...
                  </p>
                )}

                {!detailsLoading && !selectedJob && (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="font-semibold text-slate-700">
                      Nije izabrana pozicija.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Klikni na “Pogledaj detalje” kod neke pozicije.
                    </p>
                  </div>
                )}

                {!detailsLoading && selectedJob && (
                  <article className="mt-5">
                    <h3 className="text-2xl font-bold tracking-[-0.03em] text-slate-950">
                      {selectedJob.title}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {selectedJob.companyName}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge>{formatValue(selectedJob.location)}</Badge>
                      <Badge>
                        {getEmploymentTypeLabel(selectedJob.employmentType)}
                      </Badge>
                      <Badge>{getWorkModeLabel(selectedJob.workMode)}</Badge>
                      <Badge>
                        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                        Rok: {formatDate(selectedJob.deadline)}
                      </Badge>
                    </div>

                    <DetailBlock title="Opis">
                      {formatValue(selectedJob.description)}
                    </DetailBlock>

                    <DetailBlock title="Zahtevi">
                      {formatValue(selectedJob.requirements)}
                    </DetailBlock>

                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={
                          hasApplied(selectedJob.id) ||
                          applicationsLoading ||
                          isApplying === selectedJob.id
                        }
                        onClick={() => handleApply(selectedJob.id)}
                        className={`${primaryButtonClass} gap-2`}
                      >
                        {isApplying === selectedJob.id && <LoadingSpinner />}
                        {!hasApplied(selectedJob.id) &&
                          isApplying !== selectedJob.id && (
                            <Send className="h-4 w-4" />
                          )}
                        {hasApplied(selectedJob.id)
                          ? "Već si prijavljen/a"
                          : applicationsLoading
                            ? "Provera prijave..."
                          : isApplying === selectedJob.id
                            ? "Slanje prijave..."
                            : "Prijavi se"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/companies/${selectedJob.companyId}`)
                        }
                        className={secondaryButtonClass}
                      >
                        Pogledaj profil kompanije
                      </button>
                    </div>
                  </article>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <StatusToast status={status} onClose={() => setStatus(null)} />
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-slate-950">{title}</h4>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
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
