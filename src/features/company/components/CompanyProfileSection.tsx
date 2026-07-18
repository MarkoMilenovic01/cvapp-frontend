import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { CircleAlert, Save, Trash2, Upload } from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as companyApi from "@/api/companyApi";
import {
  CompanyLoadingSpinner,
  CompanyStatusToast,
} from "@/features/company/components/CompanySectionUI";

import type { CompanyRequest, CompanyResponse } from "@/types/company";

const emptyCompanyProfile: CompanyRequest = {
  name: "",
  description: "",
  website: "",
  industry: "",
};

type ProfileErrors = Partial<Record<keyof CompanyRequest, string>>;

function validateProfile(form: CompanyRequest) {
  const errors: ProfileErrors = {};

  if (!form.name.trim()) {
    errors.name = "Naziv kompanije je obavezan.";
  } else if (form.name.length > 255) {
    errors.name = "Naziv kompanije može imati najviše 255 karaktera.";
  }

  if (form.description.length > 5000) {
    errors.description = "Opis može imati najviše 5000 karaktera.";
  }

  if (form.website.length > 255) {
    errors.website = "Website može imati najviše 255 karaktera.";
  } else if (form.website && !/^https?:\/\/\S+$/.test(form.website)) {
    errors.website = "Website mora biti validna HTTP ili HTTPS adresa.";
  }

  if (form.industry.length > 100) {
    errors.industry = "Industrija može imati najviše 100 karaktera.";
  }

  return errors;
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const textareaClass =
  "min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

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
  const [validationErrors, setValidationErrors] = useState<ProfileErrors>({});

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
      setValidationErrors({});
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
    // Initial API synchronization is intentionally performed after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateProfile(form);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("");
      setError("Proveri označena polja pre čuvanja profila.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const cleanedForm: CompanyRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        industry: form.industry.trim(),
      };
      const response = await companyApi.updateMyCompanyProfile(cleanedForm);

      setProfile(response);
      setForm(cleanedForm);
      setValidationErrors({});
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

    if (!photoFile.type.startsWith("image/")) {
      setMessage("");
      setError("Izaberi validnu sliku.");
      return;
    }

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

  function updateFormField<K extends keyof CompanyRequest>(
    field: K,
    value: CompanyRequest[K],
  ) {
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
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
                <span className="inline-flex items-center gap-2">
                  <CompanyLoadingSpinner className="h-5 w-5" />
                  Učitavanje profila...
                </span>
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form
            onSubmit={handleSave}
            noValidate
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
              <Field label="Naziv kompanije" error={validationErrors.name}>
                <input
                  value={form.name}
                  placeholder="BEST Niš"
                  maxLength={256}
                  aria-invalid={Boolean(validationErrors.name)}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  className={`${inputClass} ${validationErrors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
              </Field>

              <Field label="Industrija" error={validationErrors.industry}>
                <input
                  value={form.industry}
                  placeholder="Software, Finance, Healthcare..."
                  maxLength={101}
                  aria-invalid={Boolean(validationErrors.industry)}
                  onChange={(event) =>
                    updateFormField("industry", event.target.value)
                  }
                  className={`${inputClass} ${validationErrors.industry ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Website" error={validationErrors.website}>
                  <input
                    type="url"
                    value={form.website}
                    placeholder="https://example.com"
                    maxLength={256}
                    aria-invalid={Boolean(validationErrors.website)}
                    onChange={(event) =>
                      updateFormField("website", event.target.value)
                    }
                    className={`${inputClass} ${validationErrors.website ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Opis kompanije" error={validationErrors.description}>
                  <textarea
                    value={form.description}
                    placeholder="Ukratko predstavi kompaniju, čime se bavite i kakve studente tražite..."
                    maxLength={5001}
                    aria-invalid={Boolean(validationErrors.description)}
                    onChange={(event) =>
                      updateFormField("description", event.target.value)
                    }
                    className={`${textareaClass} ${validationErrors.description ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className={primaryButtonClass}>
                {saving ? (
                  <CompanyLoadingSpinner />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Čuvanje..." : "Sačuvaj profil"}
              </button>
            </div>
          </form>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
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
                    {deletingPhoto ? (
                      <CompanyLoadingSpinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40">
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
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  {uploadingPhoto ? (
                    <CompanyLoadingSpinner />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
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
