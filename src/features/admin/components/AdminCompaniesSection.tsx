import { useCallback, useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";
import {
  AdminLoadingSpinner,
  AdminStatusToast,
} from "@/features/admin/components/AdminSectionUI";

import type { AdminCompanyResponse, PageResponse } from "@/types/admin";

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

export default function AdminCompaniesSection() {
  const [companiesPage, setCompaniesPage] =
    useState<PageResponse<AdminCompanyResponse> | null>(null);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCompanies = useCallback(
    async (page = companiesPage?.number ?? 0, showSuccessMessage = false) => {
      try {
        setLoading(true);
        setError("");

        if (showSuccessMessage) {
          setMessage("");
        }

        const response = await adminApi.getAdminCompanies(page);

        setCompaniesPage(response);

        if (showSuccessMessage) {
          setMessage("Kompanije su uspešno osvežene.");
        }
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Došlo je do greške prilikom učitavanja kompanija.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [companiesPage?.number],
  );

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCompanies(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteCompany(id: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš ovu kompaniju?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      await adminApi.deleteCompany(id);

      setMessage("Kompanija je uspešno obrisana.");
      await loadCompanies();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom brisanja kompanije.",
        ),
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
                Kompanije
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Pregled kompanija
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pregledaj kompanijske profile, osnovne podatke i po potrebi
                ukloni kompaniju sa platforme.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadCompanies(companiesPage?.number ?? 0, true)}
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
          title="Lista kompanija"
          description={`Ukupno kompanija: ${
            companiesPage?.totalElements ?? companiesPage?.content.length ?? 0
          }`}
        />

        {loading && !companiesPage ? (
          <LoadingCard text="Učitavanje kompanija..." />
        ) : companiesPage?.content.length === 0 ? (
          <EmptyState text="Nema pronađenih kompanija." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {companiesPage?.content.map((company) => {
              const deleting = deletingId === company.id;

              return (
                <article
                  key={company.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40"
                >
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#ffd21e]" />

                  <div className="flex flex-col gap-4 sm:flex-row">
                    {company.photoUrl ? (
                      <img
                        src={company.photoUrl}
                        alt={company.name}
                        className="h-24 w-24 shrink-0 rounded-3xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#f3f8fc] text-3xl font-bold text-[#1375bc] ring-1 ring-slate-200">
                        {company.name?.[0] ?? "C"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-xl font-bold tracking-[-0.03em] text-slate-950">
                          {company.name}
                        </h3>

                        <CompanyBadge />
                      </div>

                      <p className="mt-1 break-all text-sm font-medium text-slate-600">
                        {company.email}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatValue(company.industry)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <InfoItem label="ID" value={String(company.id)} />

                    <InfoItem
                      label="User ID"
                      value={String(company.userId)}
                    />

                    <InfoItem
                      label="Industrija"
                      value={formatValue(company.industry)}
                    />

                    <InfoItem
                      label="Kreirano"
                      value={formatDate(company.createdAt)}
                    />
                  </div>

                  <TextBlock title="Opis kompanije" text={company.description} />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className={secondaryButtonClass}
                      >
                        <ExternalLink className="h-4 w-4 text-[#1375bc]" />
                        Website
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(company.id)}
                      disabled={deleting}
                      className={dangerButtonClass}
                    >
                      {deleting ? (
                        <AdminLoadingSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {deleting ? "Brisanje..." : "Obriši kompaniju"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {companiesPage && !companiesPage.empty && (
          <Pagination
            page={companiesPage.number}
            totalPages={companiesPage.totalPages}
            first={companiesPage.first}
            last={companiesPage.last}
            onPrevious={() => loadCompanies(companiesPage.number - 1)}
            onNext={() => loadCompanies(companiesPage.number + 1)}
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

function InfoItem({ label, value }: { label: string; value: string }) {
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

function TextBlock({
  title,
  text,
}: {
  title: string;
  text?: string | null;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {formatValue(text)}
      </p>
    </div>
  );
}

function CompanyBadge() {
  return (
    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      COMPANY
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
