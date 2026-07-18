import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Power, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as adminApi from "@/api/adminApi";
import {
  AdminLoadingSpinner,
  AdminStatusToast,
} from "@/features/admin/components/AdminSectionUI";

import type {
  AdminAssignableRole,
  AdminUserResponse,
  PageResponse,
} from "@/types/admin";
import type { Role } from "@/types/auth";

const refreshButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60";

const selectClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:opacity-60";

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

export default function AdminUsersSection() {
  const [usersPage, setUsersPage] =
    useState<PageResponse<AdminUserResponse> | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(
    async (page = usersPage?.number ?? 0, showSuccessMessage = false) => {
      try {
        setLoading(true);
        setError("");

        if (showSuccessMessage) {
          setMessage("");
        }

        const response = await adminApi.getAdminUsers(page);

        setUsersPage(response);

        if (showSuccessMessage) {
          setMessage("Korisnici su uspešno osveženi.");
        }
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Došlo je do greške prilikom učitavanja korisnika.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [usersPage?.number],
  );

  useEffect(() => {
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleUser(id: number) {
    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      await adminApi.toggleUserEnabled(id);

      setMessage("Status korisnika je uspešno ažuriran.");
      await loadUsers();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom promene statusa korisnika.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleChangeUserRole(id: number, role: AdminAssignableRole) {
    const confirmed = window.confirm(
      `Da li želiš da promeniš ulogu korisnika na ${role}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      await adminApi.changeUserRole(id, { role });

      setMessage("Uloga korisnika je uspešno ažurirana.");
      await loadUsers();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom promene uloge korisnika.",
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteUser(id: number) {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš ovog korisnika?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      await adminApi.deleteUser(id);

      setMessage("Korisnik je uspešno obrisan.");
      await loadUsers();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom brisanja korisnika.",
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
                Korisnici
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Upravljanje korisnicima
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pregledaj korisnike, promeni im ulogu, aktiviraj/deaktiviraj
                nalog ili obriši korisnika.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadUsers(usersPage?.number ?? 0, true)}
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
          title="Lista korisnika"
          description={`Ukupno korisnika: ${
            usersPage?.totalElements ?? usersPage?.content.length ?? 0
          }`}
        />

        {loading && !usersPage ? (
          <LoadingCard text="Učitavanje korisnika..." />
        ) : usersPage?.content.length === 0 ? (
          <EmptyState text="Nema pronađenih korisnika." />
        ) : (
          <div className="space-y-4">
            {usersPage?.content.map((user) => {
              const updating = updatingId === user.id;
              const deleting = deletingId === user.id;

              return (
                <article
                  key={user.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40"
                >
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#ffd21e]" />

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-all text-lg font-bold tracking-[-0.03em] text-slate-950">
                          {user.email}
                        </h3>

                        <RoleBadge role={user.role} />

                        <StatusBadge
                          active={user.enabled}
                          activeText="Aktivan"
                          inactiveText="Deaktiviran"
                        />
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <InfoItem label="ID" value={String(user.id)} />

                        <InfoItem
                          label="Provider"
                          value={formatValue(user.provider)}
                        />

                        <InfoItem
                          label="Uloga"
                          value={formatValue(user.role)}
                        />

                        <InfoItem
                          label="Kreiran"
                          value={formatDate(user.createdAt)}
                        />
                      </div>
                    </div>

                    <div className="w-full xl:w-72">
                      <Field label="Promeni ulogu">
                        <select
                          value={user.role}
                          disabled={
                            updating || deleting || user.role === "COMPANY"
                          }
                          onChange={(event) =>
                            handleChangeUserRole(
                              user.id,
                              event.target.value as AdminAssignableRole,
                            )
                          }
                          className={selectClass}
                        >
                          {user.role === "COMPANY" ? (
                            <option value="COMPANY">COMPANY</option>
                          ) : (
                            <>
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </>
                          )}
                        </select>
                      </Field>

                      {user.role === "COMPANY" && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Uloga kompanijskog naloga se ne može menjati.
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-col">
                        <button
                          type="button"
                          onClick={() => handleToggleUser(user.id)}
                          disabled={updating || deleting}
                          className={secondaryButtonClass}
                        >
                          {updating ? (
                            <AdminLoadingSpinner />
                          ) : user.enabled ? (
                            <Power className="h-4 w-4 text-[#1375bc]" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-[#1375bc]" />
                          )}
                          {updating
                            ? "Ažuriranje..."
                            : user.enabled
                              ? "Deaktiviraj"
                              : "Aktiviraj"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={updating || deleting}
                          className={dangerButtonClass}
                        >
                          {deleting ? (
                            <AdminLoadingSpinner />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deleting ? "Brisanje..." : "Obriši korisnika"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {usersPage && !usersPage.empty && (
          <Pagination
            page={usersPage.number}
            totalPages={usersPage.totalPages}
            first={usersPage.first}
            last={usersPage.last}
            onPrevious={() => loadUsers(usersPage.number - 1)}
            onNext={() => loadUsers(usersPage.number + 1)}
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

function RoleBadge({ role }: { role: Role }) {
  const className =
    role === "ADMIN"
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : role === "COMPANY"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
        className,
      ].join(" ")}
    >
      {role}
    </span>
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
