import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CircleAlert, Eye, RefreshCw, Search, Star, StarOff } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as companyApi from "@/api/companyApi";
import CompanyCVDetailsPanel from "@/features/company/components/CompanyCVDetailsPanel";
import {
  CompanyLoadingSpinner,
  CompanyStatusToast,
} from "@/features/company/components/CompanySectionUI";
import type {
  CompanyCVDetailResponse,
  CompanyCVSummaryResponse,
  CVSearchRequest,
  PageResponse,
} from "@/types/company";

const emptySearch: CVSearchRequest = {
  keyword: "",
  skill: "",
  location: "",
};

type SearchErrors = Partial<Record<keyof CVSearchRequest, string>>;

function validateSearch(search: CVSearchRequest) {
  const errors: SearchErrors = {};

  if (search.keyword.length > 200) {
    errors.keyword = "Ključna reč može imati najviše 200 karaktera.";
  }

  if (search.skill.length > 100) {
    errors.skill = "Veština može imati najviše 100 karaktera.";
  }

  if (search.location.length > 255) {
    errors.location = "Lokacija može imati najviše 255 karaktera.";
  }

  return errors;
}

function cleanSearch(search: CVSearchRequest): CVSearchRequest {
  return {
    keyword: search.keyword.trim(),
    skill: search.skill.trim(),
    location: search.location.trim(),
  };
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

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


function hasActiveSearch(search: CVSearchRequest) {
  return Boolean(
    search.keyword.trim() || search.skill.trim() || search.location.trim(),
  );
}

export default function CompanyCVSearchSection() {
  const [search, setSearch] = useState<CVSearchRequest>(emptySearch);
  const [activeSearch, setActiveSearch] =
    useState<CVSearchRequest>(emptySearch);
  const [validationErrors, setValidationErrors] = useState<SearchErrors>({});
  const [page, setPage] = useState(0);

  const [cvPage, setCvPage] =
    useState<PageResponse<CompanyCVSummaryResponse> | null>(null);

  const [selectedCV, setSelectedCV] =
    useState<CompanyCVDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [favoriteUpdatingId, setFavoriteUpdatingId] = useState<number | null>(
    null,
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCVs = useCallback(
    async (nextPage = page, nextSearch: CVSearchRequest = search) => {
      try {
        setLoading(true);
        setError("");

        const response = hasActiveSearch(nextSearch)
          ? await companyApi.searchCVs(nextSearch, nextPage)
          : await companyApi.getAllCVs(nextPage);

        setCvPage(response);
        setPage(response.number);
        setActiveSearch(nextSearch);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Došlo je do greške prilikom učitavanja CV-jeva.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCVs(0, emptySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateSearch(search);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("");
      setError("Proveri označena polja za pretragu.");
      return;
    }

    const cleanedSearch = cleanSearch(search);
    setSearch(cleanedSearch);

    setSelectedCV(null);
    setMessage("");

    await loadCVs(0, cleanedSearch);
  }

  async function handleClearSearch() {
    setSearch(emptySearch);
    setValidationErrors({});
    setSelectedCV(null);
    setMessage("");

    await loadCVs(0, emptySearch);
  }

  function updateSearchField<K extends keyof CVSearchRequest>(
    field: K,
    value: CVSearchRequest[K],
  ) {
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
    setSearch((current) => ({ ...current, [field]: value }));
  }

  async function handleOpenCV(cvId: number) {
    try {
      setDetailsLoading(true);
      setMessage("");
      setError("");

      const response = await companyApi.getCVById(cvId);

      setSelectedCV(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja detalja CV-ja.",
        ),
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleToggleFavorite(cv: CompanyCVSummaryResponse) {
  const nextFavoriteValue = !cv.favorite;

  try {
    setFavoriteUpdatingId(cv.id);
    setMessage("");
    setError("");

    if (nextFavoriteValue) {
      await companyApi.addFavorite(cv.id);
      setMessage("CV je dodat u favorite.");
    } else {
      await companyApi.removeFavorite(cv.id);
      setMessage("CV je uklonjen iz favorita.");
    }

    setCvPage((current) =>
      current
        ? {
            ...current,
            content: current.content.map((item) =>
              item.id === cv.id
                ? { ...item, favorite: nextFavoriteValue }
                : item,
            ),
          }
        : current,
    );
  } catch (err) {
    setError(
      getErrorMessage(
        err,
        "Došlo je do greške prilikom izmene favorita.",
      ),
    );
  } finally {
    setFavoriteUpdatingId(null);
  }
}

  async function handleToggleFavoriteFromDetails() {
    if (!selectedCV) return;

    const summary = cvPage?.content.find((cv) => cv.id === selectedCV.id);

    if (!summary) {
      setError("CV nije pronađen u trenutnoj listi.");
      return;
    }

    await handleToggleFavorite(summary);
  }

  const selectedSummary = selectedCV
    ? cvPage?.content.find((cv) => cv.id === selectedCV.id)
    : null;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                CV baza
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Pretraga kandidata
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pretraži CV-jeve po imenu, veštinama, lokaciji ili kratkom
                opisu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadCVs(page, activeSearch)}
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
        <form
          onSubmit={handleSearchSubmit}
          noValidate
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-5">
            <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
              Filteri
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
              Pronađi kandidata
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Koristi jedan ili više filtera za bržu pretragu CV baze.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Ključna reč" error={validationErrors.keyword}>
              <input
                value={search.keyword}
                placeholder="Ime, opis, interesovanje..."
                maxLength={201}
                aria-invalid={Boolean(validationErrors.keyword)}
                onChange={(event) =>
                  updateSearchField("keyword", event.target.value)
                }
                className={`${inputClass} ${validationErrors.keyword ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
            </Field>

            <Field label="Veština" error={validationErrors.skill}>
              <input
                value={search.skill}
                placeholder="Java, React, Docker..."
                maxLength={101}
                aria-invalid={Boolean(validationErrors.skill)}
                onChange={(event) =>
                  updateSearchField("skill", event.target.value)
                }
                className={`${inputClass} ${validationErrors.skill ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
            </Field>

            <Field label="Lokacija" error={validationErrors.location}>
              <input
                value={search.location}
                placeholder="Maribor, Ljubljana..."
                maxLength={256}
                aria-invalid={Boolean(validationErrors.location)}
                onChange={(event) =>
                  updateSearchField("location", event.target.value)
                }
                className={`${inputClass} ${validationErrors.location ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              {loading ? (
                <CompanyLoadingSpinner />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Pretraži CV-jeve
            </button>

            <button
              type="button"
              onClick={handleClearSearch}
              className={secondaryButtonClass}
            >
              Očisti filtere
            </button>
          </div>
        </form>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <div>
              <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
              <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                Kandidati
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Pronađeno:{" "}
                {cvPage?.totalElements ?? cvPage?.content.length ?? 0}
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <CompanyLoadingSpinner />
                  Učitavanje CV-jeva...
                </span>
              </div>
            ) : cvPage?.content.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  Nema pronađenih CV-jeva.
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Probaj da promeniš filtere ili očisti pretragu.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cvPage?.content.map((cv) => {
                  const selected = selectedCV?.id === cv.id;
                  const updatingFavorite = favoriteUpdatingId === cv.id;

                  return (
                    <article
                      key={cv.id}
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
                              {cv.firstName} {cv.lastName}
                            </h4>

                            {cv.favorite && (
                              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                Favorit
                              </span>
                            )}
                          </div>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {cv.summary || "Kandidat nema dodat kratak opis."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleOpenCV(cv.id)}
                          className={
                            selected ? primaryButtonClass : secondaryButtonClass
                          }
                        >
                          <Eye
                            className={`h-4 w-4 ${selected ? "text-white" : "text-[#1375bc]"}`}
                          />
                          {selected ? "Otvoren CV" : "Otvori CV"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(cv)}
                          disabled={updatingFavorite}
                          className={secondaryButtonClass}
                        >
                          {updatingFavorite ? (
                            <CompanyLoadingSpinner />
                          ) : cv.favorite ? (
                            <StarOff className="h-4 w-4 text-[#1375bc]" />
                          ) : (
                            <Star className="h-4 w-4 text-[#1375bc]" />
                          )}
                          {updatingFavorite
                            ? "Čuvanje..."
                            : cv.favorite
                              ? "Ukloni iz favorita"
                              : "Dodaj u favorite"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {cvPage && !cvPage.empty && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                <button
                  type="button"
                  disabled={cvPage.first}
                  onClick={() => loadCVs(page - 1, activeSearch)}
                  className={secondaryButtonClass}
                >
                  Prethodna
                </button>

                <p className="text-sm font-medium text-slate-500">
                  Strana{" "}
                  <span className="font-bold text-slate-900">
                    {cvPage.number + 1}
                  </span>{" "}
                  od{" "}
                  <span className="font-bold text-slate-900">
                    {cvPage.totalPages}
                  </span>
                </p>

                <button
                  type="button"
                  disabled={cvPage.last}
                  onClick={() => loadCVs(page + 1, activeSearch)}
                  className={secondaryButtonClass}
                >
                  Sledeća
                </button>
              </div>
            )}
          </div>

          <CompanyCVDetailsPanel
  selectedCV={selectedCV}
  detailsLoading={detailsLoading}
  action={
    selectedCV
      ? {
          label: selectedSummary?.favorite
            ? "Ukloni iz favorita"
            : "Dodaj u favorite",
          loadingLabel: "Čuvanje...",
          loading: favoriteUpdatingId === selectedCV.id,
          onClick: handleToggleFavoriteFromDetails,
          variant: "secondary",
        }
      : undefined
  }
/>
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
