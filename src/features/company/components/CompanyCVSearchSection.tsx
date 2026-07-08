import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { ApiError } from "@/api/apiClient";
import * as companyApi from "@/api/companyApi";
import CompanyCVDetailsPanel from "@/features/company/components/CompanyCVDetailsPanel";
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

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

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


function hasActiveSearch(search: CVSearchRequest) {
  return Boolean(
    search.keyword.trim() || search.skill.trim() || search.location.trim(),
  );
}

export default function CompanyCVSearchSection() {
  const [search, setSearch] = useState<CVSearchRequest>(emptySearch);
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
    void loadCVs(0, emptySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSelectedCV(null);
    setMessage("");

    await loadCVs(0, search);
  }

  async function handleClearSearch() {
    setSearch(emptySearch);
    setSelectedCV(null);
    setMessage("");

    await loadCVs(0, emptySearch);
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
            onClick={() => void loadCVs(page, search)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Osveži
          </button>
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

        <form
          onSubmit={handleSearchSubmit}
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
            <Field label="Ključna reč">
              <input
                value={search.keyword}
                placeholder="Ime, opis, interesovanje..."
                onChange={(event) =>
                  setSearch((current) => ({
                    ...current,
                    keyword: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Veština">
              <input
                value={search.skill}
                placeholder="Java, React, Docker..."
                onChange={(event) =>
                  setSearch((current) => ({
                    ...current,
                    skill: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Lokacija">
              <input
                value={search.location}
                placeholder="Maribor, Ljubljana..."
                onChange={(event) =>
                  setSearch((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={primaryButtonClass}>
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
              <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                Kandidati
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Pronađeno:{" "}
                {cvPage?.totalElements ?? cvPage?.content.length ?? 0}
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                Učitavanje CV-jeva...
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
                          {selected ? "Otvoren CV" : "Otvori CV"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(cv)}
                          disabled={updatingFavorite}
                          className={secondaryButtonClass}
                        >
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
                  onClick={() => loadCVs(page - 1, search)}
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
                  onClick={() => loadCVs(page + 1, search)}
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
    </section>
  );
}


function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
