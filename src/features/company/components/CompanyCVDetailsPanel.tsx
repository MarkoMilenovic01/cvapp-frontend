import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import type { CompanyCVDetailResponse } from "@/types/company";
import { CompanyLoadingSpinner } from "@/features/company/components/CompanySectionUI";

type DetailsAction = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
};

type CompanyCVDetailsPanelProps = {
  selectedCV: CompanyCVDetailResponse | null;
  detailsLoading: boolean;
  action?: DetailsAction;
};

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1375bc] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1375bc]/20 transition hover:bg-[#075486] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

function getActionClass(variant: DetailsAction["variant"]) {
  switch (variant) {
    case "primary":
      return primaryButtonClass;
    case "danger":
      return dangerButtonClass;
    case "secondary":
    default:
      return secondaryButtonClass;
  }
}

function formatValue(value?: string | null) {
  return value && value.trim() ? value : "-";
}

export default function CompanyCVDetailsPanel({
  selectedCV,
  detailsLoading,
  action,
}: CompanyCVDetailsPanelProps) {
  return (
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 h-1 w-9 rounded-full bg-[#ffd21e]" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1375bc]">
          Detalji CV-ja
        </p>

        {detailsLoading && (
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <CompanyLoadingSpinner />
            Učitavanje detalja...
          </p>
        )}

        {!detailsLoading && !selectedCV && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-700">Nije izabran CV.</p>

            <p className="mt-1 text-sm text-slate-500">
              Klikni na “Otvori CV” kod nekog kandidata.
            </p>
          </div>
        )}

        {!detailsLoading && selectedCV && (
          <CVDetails cv={selectedCV} action={action} />
        )}
      </div>
    </aside>
  );
}

function CVDetails({
  cv,
  action,
}: {
  cv: CompanyCVDetailResponse;
  action?: DetailsAction;
}) {
  const initials = `${cv.firstName?.[0] ?? ""}${cv.lastName?.[0] ?? ""}`;
  const education = cv.education ?? [];
  const experience = cv.experience ?? [];
  const projects = cv.projects ?? [];
  const skills = cv.skills ?? [];

  return (
    <article className="mt-5">
      <div className="flex items-start gap-4">
        {cv.profilePhotoUrl ? (
          <img
            src={cv.profilePhotoUrl}
            alt={`${cv.firstName} ${cv.lastName}`}
            className="h-20 w-20 rounded-3xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#f3f8fc] text-xl font-bold text-[#1375bc]">
            {initials || "CV"}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-[-0.04em] text-slate-950">
            {cv.firstName} {cv.lastName}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {formatValue(cv.address)}
          </p>
        </div>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.loading}
          className={`${getActionClass(action.variant)} mt-5 w-full`}
        >
          {action.loading && <CompanyLoadingSpinner />}
          {action.loading ? action.loadingLabel ?? "Čuvanje..." : action.label}
        </button>
      )}

      <div className="mt-6 space-y-3">
        <InfoItem label="Telefon" value={formatValue(cv.phone)} />
        <InfoItem label="Adresa" value={formatValue(cv.address)} />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Kratak opis
          </p>

          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
            {formatValue(cv.summary)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {cv.linkedinUrl && (
          <a
            href={cv.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className={secondaryButtonClass}
          >
            <ExternalLink className="h-4 w-4 text-[#1375bc]" />
            LinkedIn
          </a>
        )}

        {cv.githubUrl && (
          <a
            href={cv.githubUrl}
            target="_blank"
            rel="noreferrer"
            className={secondaryButtonClass}
          >
            <ExternalLink className="h-4 w-4 text-[#1375bc]" />
            GitHub
          </a>
        )}

        {cv.pdfUrl && (
          <a
            href={cv.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className={primaryButtonClass}
          >
            <ExternalLink className="h-4 w-4" />
            Otvori PDF CV
          </a>
        )}
      </div>

      <DetailGroup title="Veštine">
        {skills.length === 0 ? (
          <p className="text-sm text-slate-500">Nema dodatih veština.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {skill.name}
                {skill.level ? ` · ${skill.level}` : ""}
              </span>
            ))}
          </div>
        )}
      </DetailGroup>

      <DetailGroup title="Obrazovanje">
        {education.length === 0 ? (
          <p className="text-sm text-slate-500">Nema dodatog obrazovanja.</p>
        ) : (
          <div className="space-y-3">
            {education.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-bold text-slate-950">{item.institution}</p>

                <p className="mt-1 text-sm text-slate-600">
                  {formatValue(item.degree)} — {formatValue(item.fieldOfStudy)}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {item.startDate || "?"} —{" "}
                  {item.current ? "Trenutno" : item.endDate || "?"}
                </p>
              </div>
            ))}
          </div>
        )}
      </DetailGroup>

      <DetailGroup title="Iskustvo">
        {experience.length === 0 ? (
          <p className="text-sm text-slate-500">Nema dodatog iskustva.</p>
        ) : (
          <div className="space-y-3">
            {experience.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-bold text-slate-950">{item.position}</p>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  {item.companyName}
                  {item.experienceType
                    ? ` · ${item.experienceType.replaceAll("_", " ")}`
                    : ""}
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                  {formatValue(item.description)}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {item.startDate || "?"} —{" "}
                  {item.current ? "Trenutno" : item.endDate || "?"}
                </p>
              </div>
            ))}
          </div>
        )}
      </DetailGroup>

      <DetailGroup title="Projekti">
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">Nema dodatih projekata.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-bold text-slate-950">{project.name}</p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                  {formatValue(project.description)}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {project.startDate || "?"} —{" "}
                  {project.current ? "Trenutno" : project.endDate || "?"}
                </p>

                {(project.projectUrl || project.repositoryUrl) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#1375bc] hover:underline"
                      >
                        Otvori projekat →
                      </a>
                    )}

                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#1375bc] hover:underline"
                      >
                        Repozitorijum →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DetailGroup>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function DetailGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
        {title}
      </h4>

      {children}
    </div>
  );
}
