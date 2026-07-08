import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { ApiError } from "@/api/apiClient";
import * as companyApi from "@/api/companyApi";

import type { CompanyRequest, CompanyResponse } from "@/types/company";

const emptyCompanyProfile: CompanyRequest = {
  name: "",
  description: "",
  website: "",
  industry: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const textareaClass =
  "min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#1375bc] px-4 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#1375bc]/30 hover:bg-[#f3f8fc] hover:text-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

export default function CompanyProfileSection() {
  const [profile, setProfile] = useState<CompanyResponse | null>(null);
  const [form, setForm] = useState<CompanyRequest>(emptyCompanyProfile);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await companyApi.getMyCompanyProfile();

      setProfile(response);
      setForm({
        name: response.name ?? "",
        description: response.description ?? "",
        website: response.website ?? "",
        industry: response.industry ?? "",
      });
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
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await companyApi.updateMyCompanyProfile(form);

      setProfile(response);
      setMessage("Profil kompanije je uspešno ažuriran.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom ažuriranja profila kompanije.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) return;

    try {
      setUploadingPhoto(true);
      setMessage("");
      setError("");

      await companyApi.uploadCompanyPhoto(photoFile);

      setPhotoFile(null);
      setMessage("Fotografija kompanije je uspešno otpremljena.");

      await loadProfile();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom otpremanja fotografije.",
        ),
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto() {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš fotografiju kompanije?",
    );

    if (!confirmed) return;

    try {
      setDeletingPhoto(true);
      setMessage("");
      setError("");

      await companyApi.deleteCompanyPhoto();

      setMessage("Fotografija kompanije je uspešno obrisana.");
      await loadProfile();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Došlo je do greške prilikom brisanja fotografije.",
        ),
      );
    } finally {
      setDeletingPhoto(false);
    }
  }

  if (loading) {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                Profil kompanije
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Učitavanje profila...
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Pripremamo podatke tvoje kompanije.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                Profil kompanije
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                Podaci kompanije
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                Uredi osnovne informacije, opis, industriju i fotografiju
                kompanije.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
              Status
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {profile ? "Profil aktivan" : "Profil nije kreiran"}
            </p>
          </div>
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-5">
              <div className="h-1 w-10 rounded-full bg-[#ffd21e]" />

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
                Osnovni podaci
              </p>

              <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                Informacije o kompaniji
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ove informacije studenti vide kada pregledaju profil kompanije.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Naziv kompanije">
                <input
                  value={form.name}
                  placeholder="BEST Niš"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Industrija">
                <input
                  value={form.industry}
                  placeholder="Software, Finance, Healthcare..."
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      industry: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Website">
                  <input
                    value={form.website}
                    placeholder="https://example.com"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        website: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Opis kompanije">
                  <textarea
                    value={form.description}
                    placeholder="Ukratko predstavi kompaniju, čime se bavite i kakve studente tražite..."
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className={textareaClass}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? "Čuvanje..." : "Sačuvaj profil"}
              </button>
            </div>
          </form>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1375bc]">
                  Fotografija
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950">
                  Slika kompanije
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Dodaj logo ili fotografiju koja predstavlja kompaniju.
                </p>
              </div>

              {profile?.photoUrl ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={profile.photoUrl}
                    alt={profile.name || "Fotografija kompanije"}
                    className="h-40 w-full rounded-2xl object-cover ring-1 ring-slate-200"
                  />

                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    disabled={deletingPhoto || uploadingPhoto}
                    className={`${dangerButtonClass} mt-4 w-full`}
                  >
                    {deletingPhoto ? "Brisanje..." : "Obriši fotografiju"}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f3f8fc] text-2xl font-bold text-[#1375bc]">
                    {profile?.name?.[0] || "C"}
                  </div>

                  <h4 className="mt-4 font-bold text-slate-950">
                    Nema fotografije.
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Otpremi logo ili sliku kompanije.
                  </p>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="h-1 w-9 rounded-full bg-[#ffd21e]" />

                <h4 className="mt-4 font-bold tracking-[-0.03em] text-slate-950">
                  Otpremi novu fotografiju
                </h4>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Izaberi sliku sa računara i sačuvaj je kao fotografiju
                  kompanije.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setPhotoFile(event.target.files?.[0] ?? null)
                  }
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1375bc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#075486]"
                />

                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={!photoFile || uploadingPhoto || deletingPhoto}
                  className={`${secondaryButtonClass} mt-4 w-full`}
                >
                  {uploadingPhoto ? "Otpremanje..." : "Otpremi fotografiju"}
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Trenutni naziv
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatValue(profile?.name)}
                </p>
              </div>
            </div>
          </aside>
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