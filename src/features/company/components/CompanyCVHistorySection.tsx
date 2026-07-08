import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/apiClient";
import * as companyApi from "@/api/companyApi";

import CompanyCVDetailsPanel from "@/features/company/components/CompanyCVDetailsPanel";

import type {
  CompanyCVDetailResponse,
  CVViewResponse,
} from "@/types/company";

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

function formatDate(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

export default function CompanyCVHistorySection() {
  const [history, setHistory] = useState<CVViewResponse[]>([]);
  const [selectedCV, setSelectedCV] = useState<CompanyCVDetailResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await companyApi.getHistory();

      setHistory(response);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja istorije pregleda.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function handleOpenCV(cvId: number) {
    try {
      setDetailsLoading(true);
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

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                Istorija
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Pregledani CV-jevi
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Prati kandidate koje je kompanija već otvorila.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadHistory()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
          >
            Osveži
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950">
                Istorija pregleda
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ukupno pregledanih CV-jeva: {history.length}
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
                Učitavanje istorije...
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  Još nema pregledanih CV-jeva.
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Kada otvoriš CV nekog kandidata, pojaviće se ovde.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => {
                  const selected = selectedCV?.id === item.cvId;

                  return (
                    <article
                      key={`${item.cvId}-${item.viewedAt}`}
                      className={[
                        "rounded-3xl border bg-white p-5 shadow-sm transition",
                        selected
                          ? "border-[#1375bc] ring-4 ring-[#1375bc]/10"
                          : "border-slate-200 hover:border-[#1375bc]/40",
                      ].join(" ")}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-lg font-bold tracking-[-0.03em] text-slate-950">
                            {item.firstName} {item.lastName}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            Pregledano: {formatDate(item.viewedAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenCV(item.cvId)}
                          className={selected ? primaryButtonClass : secondaryButtonClass}
                        >
                          {selected ? "Otvoren CV" : "Otvori CV"}
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
/>
        </div>
      </div>
    </section>
  );
}
