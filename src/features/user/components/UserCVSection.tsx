import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { ApiError } from "@/api/apiClient";
import * as cvApi from "@/api/cvApi";

import type {
  CVRequest,
  CVResponse,
  EducationRequest,
  ExperienceRequest,
  ProjectRequest,
  SkillRequest,
} from "@/types/cv";

type CVForm = CVRequest & {
  education: Array<EducationRequest & { id?: number }>;
  experience: Array<ExperienceRequest & { id?: number }>;
  projects: Array<ProjectRequest & { id?: number }>;
  skills: Array<SkillRequest & { id?: number }>;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const emptyCV: CVForm = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  summary: "",
  linkedinUrl: "",
  githubUrl: "",
  education: [],
  experience: [],
  projects: [],
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
  experienceType: "",
  description: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptyProject: ProjectRequest = {
  name: "",
  description: "",
  projectUrl: "",
  repositoryUrl: "",
  startDate: null,
  endDate: null,
  current: false,
};

const emptySkill: SkillRequest = {
  name: "",
  level: "",
};

const experienceTypeOptions = [
  { value: "FULL_TIME", label: "Puno radno vreme" },
  { value: "PART_TIME", label: "Nepuno radno vreme" },
  { value: "INTERNSHIP", label: "Praksa" },
  { value: "STUDENT_WORK", label: "Studentski posao" },
  { value: "VOLUNTEER", label: "Volontiranje" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "CONTRACT", label: "Ugovor" },
];

const skillNameOptions = [
  "JAVA",
  "SPRING_BOOT",
  "POSTGRESQL",
  "DOCKER",
  "GIT",
  "REACT",
  "TYPESCRIPT",
  "JAVASCRIPT",
  "HTML",
  "CSS",
  "PYTHON",
  "MACHINE_LEARNING",
  "TENSORFLOW",
  "PANDAS",
  "SQL",
  "NODE_JS",
  "EXPRESS",
  "AWS",
  "FIGMA",
  "MONGODB",
].map((value) => ({ value, label: value.replaceAll("_", " ") }));

const skillLevelOptions = [
  { value: "BEGINNER", label: "Početni" },
  { value: "INTERMEDIATE", label: "Srednji" },
  { value: "ADVANCED", label: "Napredni" },
];

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const textareaClass =
  "min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1375bc] focus:ring-4 focus:ring-[#1375bc]/10";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const addButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function mapResponseToRequest(response: CVResponse): CVForm {
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
    projects: response.projects ?? [],
    skills: response.skills ?? [],
  };
}

function profileRequest(cv: CVForm): CVRequest {
  return {
    firstName: cv.firstName,
    lastName: cv.lastName,
    phone: cv.phone,
    address: cv.address,
    summary: cv.summary,
    linkedinUrl: cv.linkedinUrl,
    githubUrl: cv.githubUrl,
  };
}

function cleanDates<T extends { startDate: string | null; endDate: string | null; current: boolean }>(
  item: T,
) {
  return {
    ...item,
    startDate: item.startDate || null,
    endDate: item.current ? null : item.endDate || null,
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}

function hasInvalidDateRange(item: {
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}) {
  if (item.current && item.endDate) {
    return true;
  }

  return Boolean(
    item.startDate && item.endDate && item.endDate < item.startDate,
  );
}

function validateCV(cv: CVForm) {
  const errors: Record<string, string> = {};

  function validateMaxLength(
    key: string,
    value: string,
    maxLength: number,
    label: string,
  ) {
    if (value.length > maxLength) {
      errors[key] = `${label} može imati najviše ${maxLength} karaktera.`;
    }
  }

  validateMaxLength("firstName", cv.firstName, 100, "Ime");
  validateMaxLength("lastName", cv.lastName, 100, "Prezime");
  validateMaxLength("phone", cv.phone, 20, "Telefon");
  validateMaxLength("address", cv.address, 255, "Adresa");
  validateMaxLength("summary", cv.summary, 5000, "Kratak opis");
  validateMaxLength("linkedinUrl", cv.linkedinUrl, 255, "LinkedIn URL");
  validateMaxLength("githubUrl", cv.githubUrl, 255, "GitHub URL");

  cv.education.forEach((item, index) => {
    const prefix = `education.${index}`;

    if (!item.institution.trim()) {
      errors[`${prefix}.institution`] = "Institucija je obavezna.";
    }
    validateMaxLength(`${prefix}.institution`, item.institution, 255, "Institucija");
    validateMaxLength(`${prefix}.degree`, item.degree, 255, "Stepen");
    validateMaxLength(
      `${prefix}.fieldOfStudy`,
      item.fieldOfStudy,
      255,
      "Oblast studija",
    );
    if (hasInvalidDateRange(item)) {
      errors[`${prefix}.endDate`] =
        "Datum završetka ne može biti pre datuma početka.";
    }
  });

  cv.experience.forEach((item, index) => {
    const prefix = `experience.${index}`;

    if (!item.companyName.trim()) {
      errors[`${prefix}.companyName`] = "Kompanija je obavezna.";
    }
    if (!item.position.trim()) {
      errors[`${prefix}.position`] = "Pozicija je obavezna.";
    }
    if (
      !item.experienceType ||
      !experienceTypeOptions.some(
        (option) => option.value === item.experienceType,
      )
    ) {
      errors[`${prefix}.experienceType`] =
        "Vrsta iskustva je obavezna.";
    }
    validateMaxLength(`${prefix}.companyName`, item.companyName, 255, "Kompanija");
    validateMaxLength(`${prefix}.position`, item.position, 255, "Pozicija");
    validateMaxLength(`${prefix}.description`, item.description, 5000, "Opis");
    if (hasInvalidDateRange(item)) {
      errors[`${prefix}.endDate`] =
        "Datum završetka ne može biti pre datuma početka.";
    }
  });

  cv.projects.forEach((item, index) => {
    const prefix = `projects.${index}`;

    if (!item.name.trim()) {
      errors[`${prefix}.name`] = "Naziv projekta je obavezan.";
    }
    validateMaxLength(`${prefix}.name`, item.name, 255, "Naziv projekta");
    validateMaxLength(`${prefix}.description`, item.description, 5000, "Opis");
    validateMaxLength(`${prefix}.projectUrl`, item.projectUrl, 500, "Link projekta");
    validateMaxLength(
      `${prefix}.repositoryUrl`,
      item.repositoryUrl,
      500,
      "Link repozitorijuma",
    );
    if (hasInvalidDateRange(item)) {
      errors[`${prefix}.endDate`] =
        "Datum završetka ne može biti pre datuma početka.";
    }
  });

  const usedSkillNames = new Set<string>();
  cv.skills.forEach((item, index) => {
    if (
      !item.name ||
      !skillNameOptions.some((option) => option.value === item.name)
    ) {
      errors[`skills.${index}.name`] = "Izaberi veštinu.";
    } else if (usedSkillNames.has(item.name)) {
      errors[`skills.${index}.name`] = "Veština je već dodata.";
    } else {
      usedSkillNames.add(item.name);
    }

    if (
      !item.level ||
      !skillLevelOptions.some((option) => option.value === item.level)
    ) {
      errors[`skills.${index}.level`] = "Izaberi nivo.";
    }
  });

  return errors;
}

async function syncEducation(
  currentItems: CVForm["education"],
  savedItems: CVResponse["education"],
) {
  const currentIds = new Set(currentItems.flatMap((item) => item.id ?? []));

  await Promise.all(
    savedItems
      .filter((item) => !currentIds.has(item.id))
      .map((item) => cvApi.deleteEducation(item.id)),
  );
  await Promise.all(
    currentItems.map((item) => {
      const request: EducationRequest = cleanDates({
        institution: item.institution,
        degree: item.degree,
        fieldOfStudy: item.fieldOfStudy,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
      });

      return item.id
        ? cvApi.updateEducation(item.id, request)
        : cvApi.addEducation(request);
    }),
  );
}

async function syncExperience(
  currentItems: CVForm["experience"],
  savedItems: CVResponse["experience"],
) {
  const currentIds = new Set(currentItems.flatMap((item) => item.id ?? []));

  await Promise.all(
    savedItems
      .filter((item) => !currentIds.has(item.id))
      .map((item) => cvApi.deleteExperience(item.id)),
  );
  await Promise.all(
    currentItems.map((item) => {
      const request: ExperienceRequest = cleanDates({
        companyName: item.companyName,
        position: item.position,
        experienceType: item.experienceType,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
      });

      return item.id
        ? cvApi.updateExperience(item.id, request)
        : cvApi.addExperience(request);
    }),
  );
}

async function syncProjects(
  currentItems: CVForm["projects"],
  savedItems: CVResponse["projects"],
) {
  const currentIds = new Set(currentItems.flatMap((item) => item.id ?? []));

  await Promise.all(
    savedItems
      .filter((item) => !currentIds.has(item.id))
      .map((item) => cvApi.deleteProject(item.id)),
  );
  await Promise.all(
    currentItems.map((item) => {
      const request: ProjectRequest = cleanDates({
        name: item.name,
        description: item.description,
        projectUrl: item.projectUrl,
        repositoryUrl: item.repositoryUrl,
        startDate: item.startDate,
        endDate: item.endDate,
        current: item.current,
      });

      return item.id
        ? cvApi.updateProject(item.id, request)
        : cvApi.addProject(request);
    }),
  );
}

async function syncSkills(
  currentItems: CVForm["skills"],
  savedItems: CVResponse["skills"],
) {
  const currentIds = new Set(currentItems.flatMap((item) => item.id ?? []));

  await Promise.all(
    savedItems
      .filter((item) => !currentIds.has(item.id))
      .map((item) => cvApi.deleteSkill(item.id)),
  );
  await Promise.all(
    currentItems.map((item) => {
      const request: SkillRequest = {
        name: item.name,
        level: item.level,
      };

      return item.id
        ? cvApi.updateSkill(item.id, request)
        : cvApi.addSkill(request);
    }),
  );
}

export function UserCVSection() {
  const [cv, setCv] = useState<CVForm>(emptyCV);
  const [savedCV, setSavedCV] = useState<CVResponse | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCV, setIsLoadingCV] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isDeletingPdf, setIsDeletingPdf] = useState(false);

  const loadCV = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoadingCV(true);
      }
      setStatus(null);

      const response = await cvApi.getMyCV();

      setSavedCV(response);
      setCv(mapResponseToRequest(response));
      setValidationErrors({});
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
      if (showLoading) {
        setIsLoadingCV(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadCV(true), 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCV]);

  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => setStatus(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  async function handleSave() {
    const errors = validateCV(cv);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setStatus({
        type: "error",
        text: "Proveri označena polja pre čuvanja CV-a.",
      });
      return;
    }

    try {
      setIsSaving(true);
      setStatus(null);
      setValidationErrors({});

      await cvApi.saveCV(profileRequest(cv));
      await Promise.all([
        syncEducation(cv.education, savedCV?.education ?? []),
        syncExperience(cv.experience, savedCV?.experience ?? []),
        syncProjects(cv.projects, savedCV?.projects ?? []),
        syncSkills(cv.skills, savedCV?.skills ?? []),
      ]);

      const response = await cvApi.getMyCV();

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
      setValidationErrors({});
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

    if (!photoFile.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Izaberi validnu sliku." });
      return;
    }

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

    if (pdfFile.type !== "application/pdf") {
      setStatus({ type: "error", text: "Izaberi validan PDF dokument." });
      return;
    }

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

  async function handleDeletePhoto() {
    if (!window.confirm("Da li želiš da obrišeš profilnu sliku?")) return;

    try {
      setIsDeletingPhoto(true);
      await cvApi.deleteCVPhoto();
      await loadCV();
      setStatus({ type: "success", text: "Profilna slika je obrisana." });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(err, "Brisanje profilne slike nije uspelo."),
      });
    } finally {
      setIsDeletingPhoto(false);
    }
  }

  async function handleDeletePdf() {
    if (!window.confirm("Da li želiš da obrišeš CV PDF?")) return;

    try {
      setIsDeletingPdf(true);
      await cvApi.deleteCVPdf();
      await loadCV();
      setStatus({ type: "success", text: "CV PDF je obrisan." });
    } catch (err) {
      setStatus({
        type: "error",
        text: getErrorMessage(err, "Brisanje CV PDF-a nije uspelo."),
      });
    } finally {
      setIsDeletingPdf(false);
    }
  }

  function clearValidation() {
    setValidationErrors({});
    setStatus((current) => (current?.type === "error" ? null : current));
  }

  function addEducation() {
    setCv((current) => ({
      ...current,
      education: [...current.education, { ...emptyEducation }],
    }));
  }

  function updateEducation(index: number, updated: EducationRequest) {
    clearValidation();
    setCv((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeEducation(index: number) {
    if (!window.confirm("Da li želiš da ukloniš ovo obrazovanje?")) return;

    clearValidation();
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
    clearValidation();
    setCv((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeExperience(index: number) {
    if (!window.confirm("Da li želiš da ukloniš ovo iskustvo?")) return;

    clearValidation();
    setCv((current) => ({
      ...current,
      experience: current.experience.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  }

  function addProject() {
    setCv((current) => ({
      ...current,
      projects: [...current.projects, { ...emptyProject }],
    }));
  }

  function updateProject(index: number, updated: ProjectRequest) {
    clearValidation();
    setCv((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeProject(index: number) {
    if (!window.confirm("Da li želiš da ukloniš ovaj projekat?")) return;

    clearValidation();
    setCv((current) => ({
      ...current,
      projects: current.projects.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function addSkill() {
    setCv((current) => ({
      ...current,
      skills: [...current.skills, { ...emptySkill }],
    }));
  }

  function updateSkill(index: number, updated: SkillRequest) {
    clearValidation();
    setCv((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) =>
        itemIndex === index ? updated : item,
      ),
    }));
  }

  function removeSkill(index: number) {
    if (!window.confirm("Da li želiš da ukloniš ovu veštinu?")) return;

    clearValidation();
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
                  Uredi lične podatke, obrazovanje, iskustvo, projekte i veštine.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoadingCV ? (
          <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <LoaderCircle className="h-9 w-9 animate-spin text-[#1375bc]" />
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Učitavanje CV-a...
            </p>
          </div>
        ) : (
        <div className="space-y-6 p-6 sm:p-8">
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
                maxLength={100}
                error={validationErrors.firstName}
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, firstName: value }));
                }}
              />

              <TextField
                label="Prezime"
                value={cv.lastName}
                maxLength={100}
                error={validationErrors.lastName}
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, lastName: value }));
                }}
              />

              <TextField
                label="Telefon"
                value={cv.phone}
                maxLength={20}
                error={validationErrors.phone}
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, phone: value }));
                }}
              />

              <TextField
                label="Adresa"
                value={cv.address}
                maxLength={255}
                error={validationErrors.address}
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, address: value }));
                }}
              />

              <TextField
                label="LinkedIn URL"
                value={cv.linkedinUrl}
                type="url"
                maxLength={255}
                error={validationErrors.linkedinUrl}
                placeholder="https://linkedin.com/in/..."
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, linkedinUrl: value }));
                }}
              />

              <TextField
                label="GitHub URL"
                value={cv.githubUrl}
                type="url"
                maxLength={255}
                error={validationErrors.githubUrl}
                placeholder="https://github.com/..."
                onChange={(value) => {
                  clearValidation();
                  setCv((current) => ({ ...current, githubUrl: value }));
                }}
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Kratak opis"
                  value={cv.summary}
                  maxLength={5000}
                  error={validationErrors.summary}
                  placeholder="Ukratko predstavi svoje interesovanje, veštine i cilj..."
                  onChange={(value) => {
                    clearValidation();
                    setCv((current) => ({ ...current, summary: value }));
                  }}
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
              <AddButton onClick={addEducation}>Dodaj obrazovanje</AddButton>
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
                        maxLength={255}
                        error={validationErrors[`education.${index}.institution`]}
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
                        maxLength={255}
                        error={validationErrors[`education.${index}.degree`]}
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
                        maxLength={255}
                        error={validationErrors[`education.${index}.fieldOfStudy`]}
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
                        error={validationErrors[`education.${index}.endDate`]}
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
              <AddButton onClick={addExperience}>Dodaj iskustvo</AddButton>
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
                        maxLength={255}
                        error={validationErrors[`experience.${index}.companyName`]}
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
                        maxLength={255}
                        error={validationErrors[`experience.${index}.position`]}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            position: value,
                          })
                        }
                      />

                      <SelectField
                        label="Vrsta iskustva"
                        value={experience.experienceType}
                        placeholder="Izaberi vrstu iskustva"
                        options={experienceTypeOptions}
                        error={validationErrors[`experience.${index}.experienceType`]}
                        onChange={(value) =>
                          updateExperience(index, {
                            ...experience,
                            experienceType:
                              value as ExperienceRequest["experienceType"],
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
                        error={validationErrors[`experience.${index}.endDate`]}
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
                          maxLength={5000}
                          error={validationErrors[`experience.${index}.description`]}
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
            eyebrow="Projekti"
            title="Lični i timski projekti"
            description="Predstavi projekte koji najbolje pokazuju tvoje znanje i praktično iskustvo."
            action={
              <AddButton onClick={addProject}>Dodaj projekat</AddButton>
            }
          >
            {cv.projects.length === 0 ? (
              <EmptyState text="Nema dodatih projekata." />
            ) : (
              <div className="space-y-4">
                {cv.projects.map((project, index) => (
                  <ItemCard
                    key={project.id ?? index}
                    title={`Projekat ${index + 1}`}
                    onRemove={() => removeProject(index)}
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <TextField
                        label="Naziv projekta"
                        value={project.name}
                        maxLength={255}
                        error={validationErrors[`projects.${index}.name`]}
                        onChange={(value) =>
                          updateProject(index, { ...project, name: value })
                        }
                      />

                      <TextField
                        label="Link projekta"
                        value={project.projectUrl}
                        type="url"
                        maxLength={500}
                        error={validationErrors[`projects.${index}.projectUrl`]}
                        placeholder="https://..."
                        onChange={(value) =>
                          updateProject(index, {
                            ...project,
                            projectUrl: value,
                          })
                        }
                      />

                      <TextField
                        label="GitHub repozitorijum"
                        value={project.repositoryUrl}
                        type="url"
                        maxLength={500}
                        error={validationErrors[`projects.${index}.repositoryUrl`]}
                        placeholder="https://github.com/..."
                        onChange={(value) =>
                          updateProject(index, {
                            ...project,
                            repositoryUrl: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum početka"
                        value={project.startDate}
                        onChange={(value) =>
                          updateProject(index, {
                            ...project,
                            startDate: value,
                          })
                        }
                      />

                      <DateField
                        label="Datum završetka"
                        value={project.endDate}
                        disabled={project.current}
                        error={validationErrors[`projects.${index}.endDate`]}
                        onChange={(value) =>
                          updateProject(index, {
                            ...project,
                            endDate: value,
                          })
                        }
                      />

                      <CheckboxField
                        label="Projekat je još u toku"
                        checked={project.current}
                        onChange={(checked) =>
                          updateProject(index, {
                            ...project,
                            current: checked,
                            endDate: checked ? null : project.endDate,
                          })
                        }
                      />

                      <div className="md:col-span-2">
                        <TextareaField
                          label="Opis"
                          value={project.description}
                          maxLength={5000}
                          error={validationErrors[`projects.${index}.description`]}
                          placeholder="Opiši projekat, svoju ulogu i korišćene tehnologije..."
                          onChange={(value) =>
                            updateProject(index, {
                              ...project,
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
            number="05"
            eyebrow="Veštine"
            title="Tehnologije i kompetencije"
            description="Dodaj veštine koje želiš da kompanije vide."
            action={
              <AddButton onClick={addSkill}>Dodaj veštinu</AddButton>
            }
          >
            {cv.skills.length === 0 ? (
              <EmptyState text="Nema dodatih veština." />
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {cv.skills.map((skill, index) => (
                  <SkillEditor
                    key={skill.id ?? index}
                    name={skill.name}
                    level={skill.level}
                    nameError={validationErrors[`skills.${index}.name`]}
                    levelError={validationErrors[`skills.${index}.level`]}
                    onNameChange={(value) =>
                      updateSkill(index, {
                        ...skill,
                        name: value as SkillRequest["name"],
                      })
                    }
                    onLevelChange={(value) =>
                      updateSkill(index, {
                        ...skill,
                        level: value as SkillRequest["level"],
                      })
                    }
                    onRemove={() => removeSkill(index)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            number="06"
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
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <img
                      src={savedCV.profilePhotoUrl}
                      alt="Profilna slika"
                      className="h-28 w-28 rounded-3xl object-cover ring-1 ring-slate-200"
                    />

                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={isDeletingPhoto || isUploadingPhoto}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeletingPhoto ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isDeletingPhoto ? "Brisanje..." : "Obriši sliku"}
                    </button>
                  </div>
                ) : (
                  <EmptyState text="Nema otpremljene profilne slike." compact />
                )}

                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPhoto || isDeletingPhoto}
                  onChange={(event) =>
                    setPhotoFile(event.target.files?.[0] ?? null)
                  }
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1375bc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#075486]"
                />

                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={!photoFile || isUploadingPhoto || isDeletingPhoto}
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  {isUploadingPhoto ? (
                    <LoadingSpinner />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploadingPhoto ? "Otpremanje..." : "Otpremi sliku"}
                </button>
              </UploadCard>

              <UploadCard
                title="CV PDF"
                description="PDF možeš koristiti kao dodatni profesionalni dokument."
              >
                {savedCV?.pdfUrl ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <a
                      href={savedCV.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4 text-[#1375bc]" />
                      Otvori PDF
                    </a>

                    <button
                      type="button"
                      onClick={handleDeletePdf}
                      disabled={isDeletingPdf || isUploadingPdf}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeletingPdf ? (
                        <LoadingSpinner />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isDeletingPdf ? "Brisanje..." : "Obriši PDF"}
                    </button>
                  </div>
                ) : (
                  <EmptyState text="Nema otpremljenog PDF-a." compact />
                )}

                <input
                  type="file"
                  accept="application/pdf"
                  disabled={isUploadingPdf || isDeletingPdf}
                  onChange={(event) =>
                    setPdfFile(event.target.files?.[0] ?? null)
                  }
                  className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1375bc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#075486]"
                />

                <button
                  type="button"
                  onClick={handleUploadPdf}
                  disabled={!pdfFile || isUploadingPdf || isDeletingPdf}
                  className={`${primaryButtonClass} mt-4 w-full`}
                >
                  {isUploadingPdf ? (
                    <LoadingSpinner />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploadingPdf ? "Otpremanje..." : "Otpremi PDF"}
                </button>
              </UploadCard>
            </div>
          </SectionCard>

          <div className="sticky bottom-6 z-10 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
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
                  {isDeleting ? (
                    <LoadingSpinner />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isDeleting ? "Brisanje..." : "Obriši CV"}
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isDeleting}
                className={primaryButtonClass}
              >
                {isSaving ? (
                  <LoadingSpinner />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? "Čuvanje..." : "Sačuvaj CV"}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {status && (
        <StatusToast status={status} onClose={() => setStatus(null)} />
      )}
    </section>
  );
}

function StatusToast({
  status,
  onClose,
}: {
  status: StatusMessage;
  onClose: () => void;
}) {
  const success = status.type === "success";

  return (
    <div
      role={success ? "status" : "alert"}
      aria-live={success ? "polite" : "assertive"}
      className={`fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${
        success ? "border-emerald-200" : "border-red-200"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          success
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {success ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-slate-900">
          {success ? "Uspešno" : "Došlo je do greške"}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{status.text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Zatvori obaveštenje"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <LoaderCircle
      className="h-4 w-4 shrink-0 animate-spin"
      aria-hidden="true"
    />
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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-bold text-[#1375bc]">
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40">
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
          className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Ukloni
        </button>
      </div>

      {children}
    </div>
  );
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={addButtonClass}>
      <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
      {children}
    </button>
  );
}

function SkillEditor({
  name,
  level,
  nameError,
  levelError,
  onNameChange,
  onLevelChange,
  onRemove,
}: {
  name: string;
  level: string;
  nameError?: string;
  levelError?: string;
  onNameChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onRemove: () => void;
}) {
  const error = nameError ?? levelError;

  return (
    <div
      className={`rounded-3xl border bg-white p-3 shadow-sm transition ${
        error ? "border-red-300" : "border-slate-200 hover:border-[#1375bc]/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-7 w-1 shrink-0 rounded-full bg-[#ffd21e]" />

        <label className="min-w-0 flex-1">
          <span className="sr-only">Veština</span>
          <select
            value={name}
            aria-invalid={Boolean(nameError)}
            onChange={(event) => onNameChange(event.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-2 focus:ring-[#1375bc]/10"
          >
            <option value="">Izaberi veštinu</option>
            {skillNameOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0 flex-1">
          <span className="sr-only">Nivo</span>
          <select
            value={level}
            aria-invalid={Boolean(levelError)}
            onChange={(event) => onLevelChange(event.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-2 focus:ring-[#1375bc]/10"
          >
            <option value="">Izaberi nivo</option>
            {skillLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Ukloni veštinu"
          title="Ukloni veštinu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>

      {error && <p className="mt-1.5 px-2 text-xs font-medium text-red-600">{error}</p>}
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#1375bc]/40">
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
  maxLength?: number;
  type?: "text" | "url";
  error?: string;
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  placeholder,
  maxLength,
  type = "text",
  error,
  onChange,
}: TextFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
        }`}
      />

      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

type TextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  onChange: (value: string) => void;
};

function TextareaField({
  label,
  value,
  placeholder,
  maxLength,
  error,
  onChange,
}: TextareaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${textareaClass} ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
        }`}
      />

      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  compact?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  placeholder,
  options,
  compact = false,
  error,
  onChange,
}: SelectFieldProps) {
  return (
    <label className={compact ? "block space-y-1" : "block space-y-2"}>
      <span
        className={
          compact
            ? "text-xs font-semibold text-slate-600"
            : "text-sm font-semibold text-slate-700"
        }
      >
        {label}
      </span>

      <select
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${
          compact
            ? "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-sm outline-none transition focus:border-[#1375bc] focus:ring-2 focus:ring-[#1375bc]/10"
            : inputClass
        } ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

type DateFieldProps = {
  label: string;
  value: string | null;
  disabled?: boolean;
  error?: string;
  onChange: (value: string | null) => void;
};

function DateField({ label, value, disabled, error, onChange }: DateFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        type="date"
        value={value ?? ""}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value || null)}
        className={`${inputClass} ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""
        }`}
      />

      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
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
    <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#1375bc] accent-[#1375bc] focus:ring-[#1375bc]"
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
