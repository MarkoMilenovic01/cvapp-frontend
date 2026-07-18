import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";
import {
  AdminLoadingSpinner,
  AdminStatusToast,
} from "@/features/admin/components/AdminSectionUI";

import type { AdminStatsResponse } from "@/types/admin";

const refreshButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

export default function AdminStatsSection() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStats = useCallback(async (showSuccessMessage = false) => {
    try {
      setLoading(true);
      setError("");

      if (showSuccessMessage) {
        setMessage("");
      }

      const response = await adminApi.getAdminStats();

      setStats(response);

      if (showSuccessMessage) {
        setMessage("Statistika je uspešno osvežena.");
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom učitavanja statistike.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStats();
  }, [loadStats]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                Statistika
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Pregled platforme
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Osnovne brojke o korisnicima, kompanijama, CV-jevima, oglasima
                i prijavama.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadStats(true)}
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
        {loading && !stats ? (
          <LoadingCard text="Učitavanje statistike..." />
        ) : !stats ? (
          <EmptyState text="Statistika trenutno nije dostupna." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Korisnici"
                value={stats.totalUsers}
                description="Ukupan broj naloga na platformi."
              />

              <StatCard
                label="Kompanije"
                value={stats.totalCompanies}
                description="Registrovani kompanijski profili."
              />

              <StatCard
                label="CV-jevi"
                value={stats.totalCVs}
                description="Korisnički CV profili."
              />

              <StatCard
                label="Prijave"
                value={stats.totalApplications}
                description="Ukupan broj poslatih prijava."
              />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5">
                <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

                <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                  Oglasi
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                  Status oglasa
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Pregled ukupnog broja oglasa i njihovog trenutnog statusa.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniStatCard label="Ukupno oglasa" value={stats.totalJobs} />

                <MiniStatCard label="Aktivni oglasi" value={stats.activeJobs} />

                <MiniStatCard
                  label="Neaktivni oglasi"
                  value={stats.inactiveJobs}
                />
              </div>
            </section>
          </>
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

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40">
      <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-4xl font-bold tracking-[-0.06em] text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function MiniStatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-slate-950">
        {value}
      </p>
    </article>
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
