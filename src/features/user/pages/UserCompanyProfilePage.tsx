import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import jobFairLogoWhite from "@/assets/jobfairnis-white.svg";
import bestLogoWhite from "@/assets/bestnis-white.svg";

import { ApiError } from "@/api/apiClient";
import * as companyDirectoryApi from "@/api/companyDirectoryApi";
import * as jobApi from "@/api/jobApi";

import { useAuth } from "@/context/AuthContext";

import type { CompanyResponse } from "@/types/company";
import type {
  JobApplicationResponse,
  JobResponse,
  PageResponse,
} from "@/types/job";

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

export default function UserCompanyProfilePage() {
  const { companyId } = useParams();
  const { logout } = useAuth();

  const numericCompanyId = Number(companyId);

  const [company, setCompany] = useState<CompanyResponse | null>(null);

  const [jobPage, setJobPage] = useState<PageResponse<JobResponse> | null>(
    null,
  );

  const [applications, setApplications] = useState<JobApplicationResponse[]>(
    [],
  );

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isNaN(numericCompanyId)) {
      void loadCompany();
      void loadCompanyJobs(0);
      void loadApplications();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericCompanyId]);

  async function loadCompany() {
    try {
      setLoading(true);
      setError("");

      const response =
        await companyDirectoryApi.getCompanyById(numericCompanyId);

      setCompany(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja profila kompanije.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanyJobs(nextPage = page) {
    try {
      setJobsLoading(true);
      setError("");

      const response = await companyDirectoryApi.getActiveJobsByCompany(
        numericCompanyId,
        nextPage,
      );

      setJobPage(response);
      setPage(response.number);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja pozicija kompanije.",
        ),
      );
    } finally {
      setJobsLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const response = await jobApi.getMyApplications();

      setApplications(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja prijava.",
        ),
      );
    }
  }

  async function handleApply(jobId: number) {
    try {
      setApplyingId(jobId);
      setMessage("");
      setError("");

      await jobApi.applyToJob(jobId);

      setMessage("Prijava je uspešno poslata.");
      await loadApplications();
    } catch (err) {
      setError(
        getErrorMessage(err, "Došlo je do greške prilikom slanja prijave."),
      );
    } finally {
      setApplyingId(null);
    }
  }

  function hasApplied(jobId: number) {
    return applications.some(
      (application) =>
        application.jobId === jobId && application.status !== "WITHDRAWN",
    );
  }

  if (Number.isNaN(numericCompanyId)) {
    return (
      <main className="min-h-screen bg-[#eef5fb] px-5 py-10 text-slate-950">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
            Neispravan ID kompanije.
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kompanija koju pokušavaš da otvoriš nije pronađena.
          </p>

          <Link to="/user" className={`${primaryButtonClass} mt-6`}>
            Nazad na dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef5fb] px-5 py-10 text-slate-950">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                  Kompanija
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                  Učitavanje profila...
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                  Pripremamo informacije o kompaniji i otvorenim pozicijama.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef5fb] text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#075486] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(19,117,188,0.42),transparent_30%),linear-gradient(135deg,#1375bc_0%,#075486_48%,#02253d_100%)]"
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <img
                src={jobFairLogoWhite}
                alt="Job Fair Internship"
                className="h-9 w-auto"
              />

              <div className="hidden h-8 w-px bg-white/20 sm:block" />

              <img
                src={bestLogoWhite}
                alt="BEST Niš"
                className="h-9 w-auto"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/user"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:border-white/30 hover:bg-white/15"
              >
                ← Nazad na dashboard
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:border-white/30 hover:bg-white/15"
              >
                Odjavi se
              </button>
            </div>
          </header>

          <div className="pb-14 pt-10 lg:pb-16 lg:pt-12">
            <div className="mb-5 h-1 w-20 rounded-full bg-[#f7c51e]" />

            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-white/55">
              Profil kompanije
            </p>

            <h1 className="mt-4 max-w-3xl font-['Space_Grotesk',sans-serif] text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
              {company?.name ?? "Kompanija"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
              Pogledaj informacije o kompaniji i otvorene pozicije na koje se
              možeš prijaviti.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="space-y-6">
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

          {!company ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
                Kompanija nije pronađena.
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Profil kompanije možda više nije dostupan.
              </p>
            </section>
          ) : (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
              <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                        Kompanija
                      </p>

                      <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                        Profil kompanije
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                        Osnovne informacije o kompaniji i dostupnim pozicijama.
                      </p>
                    </div>
                  </div>

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
                    >
                      Website →
                    </a>
                  )}
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[380px_minmax(0,1fr)]">
                <aside className="xl:sticky xl:top-6 xl:self-start">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    {company.photoUrl ? (
                      <img
                        src={company.photoUrl}
                        alt={company.name}
                        className="h-44 w-full rounded-3xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center rounded-3xl bg-[#f3f8fc] text-4xl font-bold text-[#1375bc] ring-1 ring-slate-200">
                        {company.name?.[0] ?? "C"}
                      </div>
                    )}

                    <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-950">
                      {company.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {formatValue(company.industry)}
                    </p>

                    <div className="mt-5 space-y-3">
                      <InfoItem
                        label="Industrija"
                        value={formatValue(company.industry)}
                      />

                      <InfoItem
                        label="Kreirano"
                        value={formatDate(company.createdAt)}
                      />
                    </div>
                  </div>
                </aside>

                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                      O kompaniji
                    </p>

                    <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                      Opis kompanije
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {formatValue(company.description)}
                    </p>
                  </section>

                  <section>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                        Otvorene pozicije
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Ukupno pozicija:{" "}
                        {jobPage?.totalElements ?? jobPage?.content.length ?? 0}
                      </p>
                    </div>

                    {jobsLoading ? (
                      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                        Učitavanje pozicija...
                      </div>
                    ) : jobPage?.content.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <h3 className="text-lg font-bold text-slate-950">
                          Kompanija trenutno nema otvorene pozicije.
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Proveri ponovo kasnije ili pogledaj druge kompanije.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobPage?.content.map((job) => {
                          const applied = hasApplied(job.id);
                          const applying = applyingId === job.id;

                          return (
                            <article
                              key={job.id}
                              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h4 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                                    {job.title}
                                  </h4>

                                  <p className="mt-2 text-sm text-slate-500">
                                    {formatValue(job.location)} ·{" "}
                                    {getEmploymentTypeLabel(job.employmentType)} ·{" "}
                                    {getWorkModeLabel(job.workMode)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={applied || applying}
                                  onClick={() => handleApply(job.id)}
                                  className={primaryButtonClass}
                                >
                                  {applied
                                    ? "Već si prijavljen/a"
                                    : applying
                                      ? "Slanje prijave..."
                                      : "Prijavi se"}
                                </button>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <Badge>
                                  Rok: {formatValue(job.deadline)}
                                </Badge>
                                <Badge>
                                  {getEmploymentTypeLabel(job.employmentType)}
                                </Badge>
                                <Badge>{getWorkModeLabel(job.workMode)}</Badge>
                              </div>

                              <DetailBlock title="Opis">
                                {formatValue(job.description)}
                              </DetailBlock>

                              <DetailBlock title="Zahtevi">
                                {formatValue(job.requirements)}
                              </DetailBlock>
                            </article>
                          );
                        })}
                      </div>
                    )}

                    {jobPage && !jobPage.empty && (
                      <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                        <button
                          type="button"
                          disabled={jobPage.first}
                          onClick={() => loadCompanyJobs(page - 1)}
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
                          onClick={() => loadCompanyJobs(page + 1)}
                          className={secondaryButtonClass}
                        >
                          Sledeća
                        </button>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
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
    <div className="mt-5">
      <h5 className="text-sm font-bold text-slate-950">{title}</h5>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}