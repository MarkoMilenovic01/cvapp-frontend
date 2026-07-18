import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  CalendarDays,
  CircleAlert,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as jobApi from "@/api/jobApi";
import {
  CompanyLoadingSpinner,
  CompanyStatusToast,
} from "@/features/company/components/CompanySectionUI";

import type {
  ApplicationStatus,
  JobApplicationResponse,
  JobRequest,
  JobResponse,
  PageResponse,
} from "@/types/job";

const emptyJob: JobRequest = {
  title: "",
  description: "",
  requirements: "",
  location: "",
  employmentType: "",
  workMode: "",
  deadline: null,
};

const companyStatuses: ApplicationStatus[] = [
  "REVIEWED",
  "SHORTLISTED",
  "CONTACTED",
  "REJECTED",
  "ACCEPTED",
];

type JobErrors = Partial<Record<keyof JobRequest, string>>;

function getTodayDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function validateJob(job: JobRequest) {
  const errors: JobErrors = {};

  if (!job.title.trim()) {
    errors.title = "Naziv pozicije je obavezan.";
  } else if (job.title.length > 255) {
    errors.title = "Naziv pozicije može imati najviše 255 karaktera.";
  }

  if (!job.description.trim()) {
    errors.description = "Opis pozicije je obavezan.";
  } else if (job.description.length > 10000) {
    errors.description = "Opis može imati najviše 10000 karaktera.";
  }

  if (job.requirements.length > 10000) {
    errors.requirements = "Zahtevi mogu imati najviše 10000 karaktera.";
  }

  if (job.location.length > 255) {
    errors.location = "Lokacija može imati najviše 255 karaktera.";
  }

  if (!job.employmentType) {
    errors.employmentType = "Tip angažovanja je obavezan.";
  }

  if (!job.workMode) {
    errors.workMode = "Način rada je obavezan.";
  }

  if (job.deadline && job.deadline < getTodayDate()) {
    errors.deadline = "Rok za prijavu ne može biti u prošlosti.";
  }

  return errors;
}

function cleanJob(job: JobRequest): JobRequest {
  return {
    ...job,
    title: job.title.trim(),
    description: job.description.trim(),
    requirements: job.requirements.trim(),
    location: job.location.trim(),
    deadline: job.deadline || null,
  };
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const textareaClass =
  "min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const selectClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

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

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
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

export default function CompanyJobsSection() {
  const [jobForm, setJobForm] = useState<JobRequest>(emptyJob);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null,
  );
  const [page, setPage] = useState(0);

  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    number | null
  >(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<JobErrors>({});

  useEffect(() => {
    void loadJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadJobs(nextPage = page) {
    try {
      setLoading(true);
      setError("");

      const response = await jobApi.getMyCompanyJobs(nextPage);

      setJobPage(response);
      setPage(response.number);
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
  }

  async function handleSaveJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateJob(jobForm);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("");
      setError("Proveri označena polja pre čuvanja oglasa.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const cleanedRequest = cleanJob(jobForm);

      if (editingJobId) {
        await jobApi.updateCompanyJob(editingJobId, cleanedRequest);
        setMessage("Oglas je uspešno ažuriran.");
      } else {
        await jobApi.createCompanyJob(cleanedRequest);
        setMessage("Oglas je uspešno kreiran.");
      }

      setJobForm(emptyJob);
      setEditingJobId(null);
      setValidationErrors({});

      await loadJobs(0);
    } catch (err) {
      setError(
        getErrorMessage(err, "Došlo je do greške prilikom čuvanja oglasa."),
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditJob(job: JobResponse) {
    setEditingJobId(job.id);
    setMessage("");
    setError("");
    setValidationErrors({});

    setJobForm({
      title: job.title ?? "",
      description: job.description ?? "",
      requirements: job.requirements ?? "",
      location: job.location ?? "",
      employmentType: job.employmentType ?? "",
      workMode: job.workMode ?? "",
      deadline: job.deadline ?? null,
    });
  }

  function handleCancelEdit() {
    setEditingJobId(null);
    setJobForm(emptyJob);
    setValidationErrors({});
  }

  function updateJobField<K extends keyof JobRequest>(
    field: K,
    value: JobRequest[K],
  ) {
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
    setJobForm((current) => ({ ...current, [field]: value }));
  }

  async function handleDeleteJob(id: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš ovaj oglas?",
    );

    if (!confirmed) return;

    try {
      setDeletingJobId(id);
      setMessage("");
      setError("");

      await jobApi.deleteCompanyJob(id);

      if (selectedJob?.id === id) {
        setSelectedJob(null);
        setApplications([]);
      }

      if (editingJobId === id) {
        setEditingJobId(null);
        setJobForm(emptyJob);
      }

      setMessage("Oglas je uspešno obrisan.");
      await loadJobs(page);
    } catch (err) {
      setError(
        getErrorMessage(err, "Došlo je do greške prilikom brisanja oglasa."),
      );
    } finally {
      setDeletingJobId(null);
    }
  }

  async function handleViewApplications(job: JobResponse) {
    try {
      setApplicationsLoading(true);
      setMessage("");
      setError("");

      setSelectedJob(job);

      const response = await jobApi.getApplicationsForJob(job.id);
      setApplications(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja prijava.",
        ),
      );
    } finally {
      setApplicationsLoading(false);
    }
  }

  async function handleUpdateStatus(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    try {
      setUpdatingApplicationId(applicationId);
      setMessage("");
      setError("");

      await jobApi.updateApplicationStatus(applicationId, { status });

      setMessage("Status prijave je uspešno ažuriran.");

      if (selectedJob) {
        const response = await jobApi.getApplicationsForJob(selectedJob.id);
        setApplications(response);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom ažuriranja statusa.",
        ),
      );
    } finally {
      setUpdatingApplicationId(null);
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
                Pozicije kompanije
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Kreiraj oglase, uređuj otvorene pozicije i prati prijave
                kandidata.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadJobs(page)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <CompanyLoadingSpinner />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Osveži
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <form
              onSubmit={handleSaveJob}
              noValidate
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                    {editingJobId ? "Uređivanje oglasa" : "Novi oglas"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                    {editingJobId ? "Izmeni poziciju" : "Kreiraj poziciju"}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Popuni osnovne informacije koje studenti vide kada otvore
                    oglas.
                  </p>
                </div>

                {editingJobId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={secondaryButtonClass}
                  >
                    <X className="h-4 w-4 text-[#1375bc]" />
                    Otkaži izmenu
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Naziv pozicije" error={validationErrors.title}>
                  <input
                    value={jobForm.title}
                    placeholder="Backend Developer Intern"
                    maxLength={256}
                    aria-invalid={Boolean(validationErrors.title)}
                    onChange={(event) =>
                      updateJobField("title", event.target.value)
                    }
                    className={`${inputClass} ${validationErrors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </Field>

                <Field label="Lokacija" error={validationErrors.location}>
                  <input
                    value={jobForm.location}
                    placeholder="Niš, Beograd, Remote..."
                    maxLength={256}
                    aria-invalid={Boolean(validationErrors.location)}
                    onChange={(event) =>
                      updateJobField("location", event.target.value)
                    }
                    className={`${inputClass} ${validationErrors.location ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </Field>

                <Field
                  label="Tip angažovanja"
                  error={validationErrors.employmentType}
                >
                  <select
                    value={jobForm.employmentType}
                    aria-invalid={Boolean(validationErrors.employmentType)}
                    onChange={(event) =>
                      updateJobField(
                        "employmentType",
                        event.target.value as JobRequest["employmentType"],
                      )
                    }
                    className={`${selectClass} ${validationErrors.employmentType ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  >
                    <option value="">Izaberi tip</option>
                    <option value="INTERNSHIP">Praksa</option>
                    <option value="STUDENT_WORK">Studentski posao</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="FULL_TIME">Full time</option>
                  </select>
                </Field>

                <Field label="Način rada" error={validationErrors.workMode}>
                  <select
                    value={jobForm.workMode}
                    aria-invalid={Boolean(validationErrors.workMode)}
                    onChange={(event) =>
                      updateJobField(
                        "workMode",
                        event.target.value as JobRequest["workMode"],
                      )
                    }
                    className={`${selectClass} ${validationErrors.workMode ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  >
                    <option value="">Izaberi način rada</option>
                    <option value="ONSITE">U kancelariji</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </Field>

                <Field label="Rok za prijavu" error={validationErrors.deadline}>
                  <input
                    type="date"
                    value={jobForm.deadline ?? ""}
                    min={getTodayDate()}
                    aria-invalid={Boolean(validationErrors.deadline)}
                    onChange={(event) =>
                      updateJobField("deadline", event.target.value || null)
                    }
                    className={`${inputClass} ${validationErrors.deadline ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </Field>

                <div className="hidden md:block" />

                <div className="md:col-span-2">
                  <Field
                    label="Opis pozicije"
                    error={validationErrors.description}
                  >
                    <textarea
                      value={jobForm.description}
                      placeholder="Ukratko opiši poziciju, tim, odgovornosti i šta student može da nauči..."
                      maxLength={10001}
                      aria-invalid={Boolean(validationErrors.description)}
                      onChange={(event) =>
                        updateJobField("description", event.target.value)
                      }
                      className={`${textareaClass} ${validationErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Zahtevi" error={validationErrors.requirements}>
                    <textarea
                      value={jobForm.requirements}
                      placeholder="Npr. osnovno poznavanje React-a, Java, SQL, komunikacija, motivacija..."
                      maxLength={10001}
                      aria-invalid={Boolean(validationErrors.requirements)}
                      onChange={(event) =>
                        updateJobField("requirements", event.target.value)
                      }
                      className={`${textareaClass} ${validationErrors.requirements ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={saving} className={primaryButtonClass}>
                  {saving ? (
                    <CompanyLoadingSpinner />
                  ) : editingJobId ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {saving
                    ? "Čuvanje..."
                    : editingJobId
                      ? "Sačuvaj izmene"
                      : "Kreiraj oglas"}
                </button>

                {editingJobId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={secondaryButtonClass}
                  >
                    <RotateCcw className="h-4 w-4 text-[#1375bc]" />
                    Resetuj formu
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-4">
              <div>
                <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
                <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                  Objavljeni oglasi
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ukupno oglasa: {jobPage?.totalElements ?? jobPage?.content.length ?? 0}
                </p>
              </div>

              {loading ? (
                <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <CompanyLoadingSpinner />
                    Učitavanje oglasa...
                  </span>
                </div>
              ) : jobPage?.content.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h3 className="text-lg font-bold text-slate-950">
                    Još nema objavljenih oglasa.
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Kada kreiraš oglas, pojaviće se ovde.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobPage?.content.map((job) => {
                    const selected = selectedJob?.id === job.id;
                    const deleting = deletingJobId === job.id;

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

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold tracking-[-0.03em] text-slate-950">
                                {job.title}
                              </h4>

                              <span
                                className={[
                                  "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                                  job.active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600",
                                ].join(" ")}
                              >
                                {job.active ? "Aktivan" : "Neaktivan"}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                              {formatValue(job.location)} ·{" "}
                              {getEmploymentTypeLabel(job.employmentType)} ·{" "}
                              {getWorkModeLabel(job.workMode)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleViewApplications(job)}
                            className={selected ? primaryButtonClass : secondaryButtonClass}
                          >
                            <Users
                              className={`h-4 w-4 ${selected ? "text-white" : "text-[#1375bc]"}`}
                            />
                            {selected ? "Prijave otvorene" : "Prikaži prijave"}
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge>
                            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                            Rok: {formatValue(job.deadline)}
                          </Badge>
                          <Badge>{getEmploymentTypeLabel(job.employmentType)}</Badge>
                          <Badge>{getWorkModeLabel(job.workMode)}</Badge>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleEditJob(job)}
                            className={secondaryButtonClass}
                          >
                            <Pencil className="h-4 w-4 text-[#1375bc]" />
                            Uredi
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deleting}
                            className={dangerButtonClass}
                          >
                            {deleting ? (
                              <CompanyLoadingSpinner />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {deleting ? "Brisanje..." : "Obriši"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {jobPage && !jobPage.empty && (
                <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                  <button
                    type="button"
                    disabled={jobPage.first}
                    onClick={() => loadJobs(page - 1)}
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
                    onClick={() => loadJobs(page + 1)}
                    className={secondaryButtonClass}
                  >
                    Sledeća
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1375bc]">
                Prijave kandidata
              </p>

              {!selectedJob && (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="font-semibold text-slate-700">
                    Nije izabran oglas.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Klikni na “Prikaži prijave” kod nekog oglasa.
                  </p>
                </div>
              )}

              {selectedJob && (
                <div className="mt-5">
                  <h3 className="text-xl font-bold tracking-[-0.04em] text-slate-950">
                    {selectedJob.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Ukupno prijava: {applications.length}
                  </p>

                  {applicationsLoading ? (
                    <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                      <CompanyLoadingSpinner />
                      Učitavanje prijava...
                    </p>
                  ) : applications.length === 0 ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="font-semibold text-slate-700">
                        Još nema prijava.
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Kada se kandidat prijavi, videćeš ga ovde.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {applications.map((application) => {
                        const updating =
                          updatingApplicationId === application.id;

                        return (
                          <article
                            key={application.id}
                            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#1375bc]/40"
                          >
                            <div className="mb-3 h-1 w-8 rounded-full bg-[#ffd21e]" />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h4 className="font-bold tracking-[-0.03em] text-slate-950">
                                  {application.cvFirstName}{" "}
                                  {application.cvLastName}
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                  Prijavljeno:{" "}
                                  {formatDate(application.appliedAt)}
                                </p>
                              </div>

                              <span
                                className={[
                                  "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold",
                                  getStatusClass(application.status),
                                ].join(" ")}
                              >
                                {getStatusLabel(application.status)}
                              </span>
                            </div>

                            <div className="mt-4">
                              <Field label="Promeni status">
                                <select
                                  value={application.status}
                                  disabled={updating}
                                  onChange={(event) =>
                                    handleUpdateStatus(
                                      application.id,
                                      event.target.value as ApplicationStatus,
                                    )
                                  }
                                  className={selectClass}
                                >
                                  {!companyStatuses.includes(
                                    application.status,
                                  ) && (
                                    <option
                                      value={application.status}
                                      disabled
                                    >
                                      {getStatusLabel(application.status)}
                                    </option>
                                  )}
                                  {companyStatuses.map((status) => (
                                    <option key={status} value={status}>
                                      {getStatusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                              {updating && (
                                <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                                  <CompanyLoadingSpinner />
                                  Ažuriranje statusa...
                                </p>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <CompanyStatusToast
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
  children: ReactNode;
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

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {children}
    </span>
  );
}
