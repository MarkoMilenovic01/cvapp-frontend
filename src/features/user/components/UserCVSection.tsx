import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ApiError } from "@/api/apiClient";
import * as cvApi from "@/api/cvApi";

import type {
  CVRequest,
  CVResponse,
  EducationRequest,
  ExperienceRequest,
  SkillRequest,
} from "@/types/cv";

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const emptyCV: CVRequest = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  summary: "",
  linkedinUrl: "",
  githubUrl: "",
  education: [],
  experience: [],
  skills: [],
};

const emptyEducation: EducationRequest = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptyExperience: ExperienceRequest = {
  companyName: "",
  position: "",
  description: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptySkill: SkillRequest = {
  name: "",
  level: "",
};

const inputClass =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const textareaClass =
  "min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-2xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:-translate-y-0.5 hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1375bc]/30 hover:bg-[#f3f8fc] hover:text-[#075486] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

const dangerButtonClass =
  "inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

function mapResponseToRequest(response: CVResponse): CVRequest {
  return {
    firstName: response.firstName ?? "",
    lastName: response.lastName ?? "",
    phone: response.phone ?? "",
    address: response.address ?? "",
    summary: response.summary ?? "",
    linkedinUrl: response.linkedinUrl ?? "",
    githubUrl: response.githubUrl ?? "",
    education: response.education ?? [],
    experience: response.experience ?? [],
    skills: response.skills ?? [],
  };
}

function cleanCVBeforeSave(cv: CVRequest): CVRequest {
  return {
    ...cv,
    education: cv.education.map((education) => ({
      ...education,
      startDate: education.startDate || null,
      endDate: education.current ? null : education.endDate || null,
    })),
    experience: cv.experience.map((experience) => ({
      ...experience,
      startDate: experience.startDate || null,
      endDate: experience.current ? null : experience.endDate || null,
    })),
    skills: cv.skills,
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

export function UserCVSection() {
  const [cv, setCv] = useState<CVRequest>(emptyCV);
  const [savedCV, setSavedCV] = useState<CVResponse | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [status, setStatus] = useState<StatusMessage | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const loadCV = useCallback(async () => {
    try {
      setStatus(null);

      const response = await cvApi.getMyCV();

      setSavedCV(response);
      setCv(mapResponseToRequest(response));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSavedCV(null);
        setCv(emptyCV);
      } else {
        setStatus({
          type: "error",
          text: getErrorMessage(
            err,
            "Došlo je do greške prilikom učitavanja CV-a.",
          ),
        });
      }
    } finally {
    }
  }, []);

  useEffect(() => {
    void loadCV();
  }, [loadCV]);

  async function handleSave() {
    try {
      setIsSaving(true);
      setStatus(null);

      const response = await cvApi.saveCV(cleanCVBeforeSave(cv));

      setSavedCV(response);
      setCv(mapResponseToRequest(response));
      setStatus({
        type: "success",
        text: "CV je uspešno sačuvan.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(err, "Došlo je do greške prilikom čuvanja CV-a."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCV() {
    const confirmed = window.confirm(
      "Da li si siguran da želiš da obrišeš CV?",
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setStatus(null);

      await cvApi.deleteCV();

      setSavedCV(null);
      setCv(emptyCV);
      setPhotoFile(null);
      setPdfFile(null);

      setStatus({
        type: "success",
        text: "CV je uspešno obrisan.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(err, "Došlo je do greške prilikom brisanja CV-a."),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleUploadPhoto() {
    if (!photoFile) return;

    try {
      setIsUploadingPhoto(true);
      setStatus(null);

      await cvApi.uploadCVPhoto(photoFile);

      setPhotoFile(null);
      await loadCV();

      setStatus({
        type: "success",
        text: "Profilna slika je uspešno otpremljena.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(
          err,
          "Došlo je do greške prilikom otpremanja slike.",
        ),
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleUploadPdf() {
    if (!pdfFile) return;

    try {
      setIsUploadingPdf(true);
      setStatus(null);

      await cvApi.uploadCVPdf(pdfFile);

      setPdfFile(null);
      await loadCV();

      setStatus({
        type: "success",
        text: "PDF je uspešno otpremljen.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(
          err,
          "Došlo je do greške prilikom otpremanja PDF-a.",
        ),
      });
    } finally {
      setIsUploadingPdf(false);
    }
  }

  function addEducation() {
    setCv((current) => ({
      ...current,
      education: [...current.education, { ...emptyEducation }],
    }));
  }

  function updateEducation(index: number, updated: EducationRequest) {
    setCv((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeEducation(index: number) {
    setCv((current) => ({
      ...current,
      education: current.education.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addExperience() {
    setCv((current) => ({
      ...current,
      experience: [...current.experience, { ...emptyExperience }],
    }));
  }

  function updateExperience(index: number, updated: ExperienceRequest) {
    setCv((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeExperience(index: number) {
    setCv((current) => ({
      ...current,
      experience: current.experience.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  }

  function addSkill() {
    setCv((current) => ({
      ...current,
      skills: [...current.skills, { ...emptySkill }],
    }));
  }

  function updateSkill(index: number, updated: SkillRequest) {
    setCv((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeSkill(index: number) {
    setCv((current) => ({
      ...current,
      skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  }


  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div className="border-b border-slate-200 bg-[#1375bc] px-6 py-5 text-white sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-12 w-1.5 shrink-0 rounded-full bg-[#ffd21e]" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                  CV profil
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                  Moj CV
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">
                  Uredi lične podatke, obrazovanje, iskustvo i veštine.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {status && (
            <div
              className={[
                "rounded-3xl border px-5 py-4 text-sm font-semibold",
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {status.text}
            </div>
          )}

          {!savedCV && (
            <div className="rounded-3xl border border-[#ffd21e]/60 bg-[#fff8d6] px-5 py-4 text-sm font-medium text-slate-700">
              Tvoj CV još nije kreiran. Popuni osnovne podatke i sačuvaj profil
              kada budeš spreman.
            </div>
          )}

          <SectionCard
            number="01"
            eyebrow="Osnovni podaci"
            title="Lični profil"
            description="Ovo su osnovne informacije koje kompanije prvo vide."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Ime"
                value={cv.firstName}
                onChange={(value) =>
                  setCv((current) => ({ ...current, firstName: value }))
                }
              />

              <TextField
                label="Prezime"
                value={cv.lastName}
                onChange={(value) =>
                  setCv((current) => ({ ...current, lastName: value }))
                }
              />

              <TextField
                label="Telefon"
                value={cv.phone}
                onChange={(value) =>
                  setCv((current) => ({ ...current, phone: value }))
                }
              />

              <TextField
                label="Adresa"
                value={cv.address}
                onChange={(value) =>
                  setCv((current) => ({ ...current, address: value }))
                }
              />

              <TextField
                label="LinkedIn URL"
                value={cv.linkedinUrl}
                placeholder="https://linkedin.com/in/..."
                onChange={(value) =>
                  setCv((current) => ({ ...current, linkedinUrl: value }))
                }
              />

              <TextField
                label="GitHub URL"
                value={cv.githubUrl}
                placeholder="https://github.com/..."
                onChange={(value) =>
                  setCv((current) => ({ ...current, githubUrl: value }))
                }
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Kratak opis"
                  value={cv.summary}
                  placeholder="Ukratko predstavi svoje interesovanje, veštine i cilj..."
                  onChange={(value) =>
                    setCv((current) => ({ ...current, summary: value }))
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number="02"
            eyebrow="Obrazovanje"
            title="Fakultet, smer ili škola"
            description="Dodaj relevantno obrazovanje koje želiš da prikažeš kompanijama."
            action={
              <button
                type="button"
                onClick={addEducation}
                className={secondaryButtonClass}
              >
                + Dodaj obrazovanje
              </button>
            }
          >
            {cv.education.length === 0 ? (
              <EmptyState text="Nema dodatog obrazovanja." />
            ) : (
              <div className="space-y-4">
                {cv.education.map((education, index) => (
                  <ItemCard
                    key={index}
                    title={`Obrazovanje ${index + 1}`}
                    onRemove={() => removeEducation(index)}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <TextField
                        label="Institucija"
                        value={education.institution}
                        onChange={(value) =>
                          updateEducation(index, {
                            ...education,
                            institution: value,
                          })
                        }
                      />

                      <TextField
                        label="Stepen"
                        value={education.degree}
                        placeholder="Bachelor / Master / ..."
                        onChange={(value) =>
                          updateEducation(index, {
                            ...education,
                            degree: value,
                          })
                        }
                      />

                      <TextField
                        label="Oblast studija"
                        value={education.fieldOfStudy}
                        onChange={(value) =>
                          updateEducation(index, {
                            ...education,
                            fieldOfStudy: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum početka"
                        value={education.startDate}
                        onChange={(value) =>
                          updateEducation(index, {
                            ...education,
                            startDate: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum završetka"
                        value={education.endDate}
                        disabled={education.current}
                        onChange={(value) =>
                          updateEducation(index, {
                            ...education,
                            endDate: value,
                          })
                        }
                      />

                      <CheckboxField
                        label="Trenutno studiram ovde"
                        checked={education.current}
                        onChange={(checked) =>
                          updateEducation(index, {
                            ...education,
                            current: checked,
                            endDate: checked ? null : education.endDate,
                          })
                        }
                      />
                    </div>
                  </ItemCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            number="03"
            eyebrow="Iskustvo"
            title="Praksa, posao ili projekti"
            description="Dodaj iskustva koja najbolje pokazuju tvoje znanje i motivaciju."
            action={
              <button
                type="button"
                onClick={addExperience}
                className={secondaryButtonClass}
              >
                + Dodaj iskustvo
              </button>
            }
          >
            {cv.experience.length === 0 ? (
              <EmptyState text="Nema dodatog iskustva." />
            ) : (
              <div className="space-y-4">
                {cv.experience.map((experience, index) => (
                  <ItemCard
                    key={index}
                    title={`Iskustvo ${index + 1}`}
                    onRemove={() => removeExperience(index)}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <TextField
                        label="Kompanija"
                        value={experience.companyName}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            companyName: value,
                          })
                        }
                      />

                      <TextField
                        label="Pozicija"
                        value={experience.position}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            position: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum početka"
                        value={experience.startDate}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            startDate: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum završetka"
                        value={experience.endDate}
                        disabled={experience.current}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            endDate: value,
                          })
                        }
                      />

                      <CheckboxField
                        label="Trenutno radim ovde"
                        checked={experience.current}
                        onChange={(checked) =>
                          updateExperience(index, {
                            ...experience,
                            current: checked,
                            endDate: checked ? null : experience.endDate,
                          })
                        }
                      />

                      <div className="md:col-span-2">
                        <TextareaField
                          label="Opis"
                          value={experience.description}
                          placeholder="Opiši šta si radio/la, koje tehnologije si koristio/la i šta si naučio/la..."
                          onChange={(value) =>
                            updateExperience(index, {
                              ...experience,
                              description: value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </ItemCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            number="04"
            eyebrow="Veštine"
            title="Tehnologije i kompetencije"
            description="Dodaj veštine koje želiš da kompanije vide."
            action={
              <button
                type="button"
                onClick={addSkill}
                className={secondaryButtonClass}
              >
                + Dodaj veštinu
              </button>
            }
          >
            {cv.skills.length === 0 ? (
              <EmptyState text="Nema dodatih veština." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {cv.skills.map((skill, index) => (
                  <ItemCard
                    key={index}
                    title={`Veština ${index + 1}`}
                    onRemove={() => removeSkill(index)}
                  >
                    <div className="space-y-4">
                      <TextField
                        label="Naziv"
                        value={skill.name}
                        placeholder="React, Java, Spring Boot..."
                        onChange={(value) =>
                          updateSkill(index, {
                            ...skill,
                            name: value,
                          })
                        }
                      />

                      <TextField
                        label="Nivo"
                        value={skill.level}
                        placeholder="Beginner / Intermediate / Advanced"
                        onChange={(value) =>
                          updateSkill(index, {
                            ...skill,
                            level: value,
                          })
                        }
                      />
                    </div>
                  </ItemCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            number="05"
            eyebrow="Dokumenti"
            title="Profilna slika i CV PDF"
            description="Dodaj sliku i PDF verziju ako želiš kompletniji profil."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <UploadCard
                title="Profilna slika"
                description="Fotografija pomaže da profil izgleda profesionalnije."
              >
                {savedCV?.profilePhotoUrl ? (
                  <img
                    src={savedCV.profilePhotoUrl}
                    alt="Profilna slika"
                    className="mt-4 h-28 w-28 rounded-3xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <EmptyState text="Nema otpremljene profilne slike." compact />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setPhotoFile(event.target.files?.[0] ?? null)
                  }
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-[#1375bc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#075486]"
                />

                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={!photoFile || isUploadingPhoto}
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  {isUploadingPhoto ? "Otpremanje..." : "Otpremi sliku"}
                </button>
              </UploadCard>

              <UploadCard
                title="CV PDF"
                description="PDF možeš koristiti kao dodatni profesionalni dokument."
              >
                {savedCV?.pdfUrl ? (
                  <a
                    href={savedCV.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-2xl bg-[#f3f8fc] px-4 py-3 text-sm font-semibold text-[#1375bc] transition hover:bg-[#e7f1f8] hover:text-[#075486]"
                  >
                    Otvori otpremljeni PDF →
                  </a>
                ) : (
                  <EmptyState text="Nema otpremljenog PDF-a." compact />
                )}

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setPdfFile(event.target.files?.[0] ?? null)
                  }
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-[#1375bc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#075486]"
                />

                <button
                  type="button"
                  onClick={handleUploadPdf}
                  disabled={!pdfFile || isUploadingPdf}
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  {isUploadingPdf ? "Otpremanje..." : "Otpremi PDF"}
                </button>
              </UploadCard>
            </div>
          </SectionCard>

          <div className="sticky bottom-6 z-10 rounded-[1.75rem] border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h3 className="font-bold tracking-[-0.03em] text-slate-950">
                Sačuvaj promene
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Promene neće biti vidljive kompanijama dok ne sačuvaš CV.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row">
              {savedCV && (
                <button
                  type="button"
                  onClick={handleDeleteCV}
                  disabled={isDeleting || isSaving}
                  className={dangerButtonClass}
                >
                  {isDeleting ? "Brisanje..." : "Obriši CV"}
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting}
                className={primaryButtonClass}
              >
                {isSaving ? "Čuvanje..." : "Sačuvaj CV"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type SectionCardProps = {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

function SectionCard({
  number,
  eyebrow,
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3f8fc] text-sm font-bold text-[#1375bc]">
            {number}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1375bc]">
              {eyebrow}
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-[-0.04em] text-slate-950">
              {title}
            </h3>

            {description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

type ItemCardProps = {
  title: string;
  onRemove: () => void;
  children: ReactNode;
};

function ItemCard({ title, onRemove, children }: ItemCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="h-1 w-8 rounded-full bg-[#ffd21e]" />

          <h4 className="mt-3 font-bold tracking-[-0.03em] text-slate-950">
            {title}
          </h4>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-2xl px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          Ukloni
        </button>
      </div>

      {children}
    </div>
  );
}

type UploadCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function UploadCard({ title, description, children }: UploadCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
      <div className="h-1 w-9 rounded-full bg-[#ffd21e]" />

      <h4 className="mt-4 font-bold tracking-[-0.03em] text-slate-950">
        {title}
      </h4>

      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>

      {children}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function TextareaField({
  label,
  value,
  placeholder,
  onChange,
}: TextareaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={textareaClass}
      />
    </label>
  );
}

type DateFieldProps = {
  label: string;
  value: string | null;
  disabled?: boolean;
  onChange: (value: string | null) => void;
};

function DateField({ label, value, disabled, onChange }: DateFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        type="date"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || null)}
        className={inputClass}
      />
    </label>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#1375bc] focus:ring-[#1375bc]"
      />

      {label}
    </label>
  );
}

function EmptyState({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[1.25rem] border border-dashed border-slate-300 bg-white text-center text-sm font-medium text-slate-500",
        compact ? "mt-4 px-4 py-5" : "px-4 py-8",
      ].join(" ")}
    >
      {text}
    </div>
  );
}