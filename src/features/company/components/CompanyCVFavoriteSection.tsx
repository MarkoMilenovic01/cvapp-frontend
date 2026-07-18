import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, Trash2 } from "lucide-react";

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
} from "@/types/company";

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



export default function CompanyCVFavoriteSection() {
  const [favorites, setFavorites] = useState<CompanyCVSummaryResponse[]>([]);
  const [selectedCV, setSelectedCV] = useState<CompanyCVDetailResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await companyApi.getFavorites();

      setFavorites(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja favorita.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFavorites();
  }, [loadFavorites]);

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

  async function handleRemoveFavorite(cvId: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da ukloniš ovaj CV iz favorita?",
    );

    if (!confirmed) return;

    try {
      setRemovingId(cvId);
      setMessage("");
      setError("");

      await companyApi.removeFavorite(cvId);

      setFavorites((current) => current.filter((cv) => cv.id !== cvId));

      if (selectedCV?.id === cvId) {
        setSelectedCV(null);
      }

      setMessage("CV je uklonjen iz favorita.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom uklanjanja favorita.",
        ),
      );
    } finally {
      setRemovingId(null);
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
                Favoriti
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Sačuvani kandidati
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pregledaj CV-jeve koje je kompanija označila kao zanimljive.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadFavorites()}
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
          <div className="space-y-4">
            <div>
              <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
              <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                Lista favorita
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ukupno sačuvanih CV-jeva: {favorites.length}
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <CompanyLoadingSpinner />
                  Učitavanje favorita...
                </span>
              </div>
            ) : favorites.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  Još nema sačuvanih kandidata.
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Kada dodaš CV u favorite, pojaviće se ovde.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((cv) => {
                  const selected = selectedCV?.id === cv.id;
                  const removing = removingId === cv.id;

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

                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Favorit
                            </span>
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
                          className={selected ? primaryButtonClass : secondaryButtonClass}
                        >
                          <Eye
                            className={`h-4 w-4 ${selected ? "text-white" : "text-[#1375bc]"}`}
                          />
                          {selected ? "Otvoren CV" : "Otvori CV"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(cv.id)}
                          disabled={removing}
                          className={dangerButtonClass}
                        >
                          {removing ? (
                            <CompanyLoadingSpinner />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {removing ? "Uklanjanje..." : "Ukloni iz favorita"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <CompanyCVDetailsPanel
  selectedCV={selectedCV}
  detailsLoading={detailsLoading}
  action={
    selectedCV
      ? {
          label: "Ukloni iz favorita",
          loadingLabel: "Uklanjanje...",
          loading: removingId === selectedCV.id,
          onClick: () => handleRemoveFavorite(selectedCV.id),
          variant: "danger",
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
