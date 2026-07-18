export interface EducationRequest {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}

export interface EducationResponse extends EducationRequest {
  id: number;
}

export interface ExperienceRequest {
  companyName: string;
  position: string;
  experienceType: ExperienceType | "";
  description: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}

export type ExperienceType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "STUDENT_WORK"
  | "VOLUNTEER"
  | "FREELANCE"
  | "CONTRACT";

export interface ExperienceResponse extends ExperienceRequest {
  id: number;
}

export interface SkillRequest {
  name: SkillName | "";
  level: SkillLevel | "";
}

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SkillName =
  | "JAVA"
  | "SPRING_BOOT"
  | "POSTGRESQL"
  | "DOCKER"
  | "GIT"
  | "REACT"
  | "TYPESCRIPT"
  | "JAVASCRIPT"
  | "HTML"
  | "CSS"
  | "PYTHON"
  | "MACHINE_LEARNING"
  | "TENSORFLOW"
  | "PANDAS"
  | "SQL"
  | "NODE_JS"
  | "EXPRESS"
  | "AWS"
  | "FIGMA"
  | "MONGODB";

export interface SkillResponse extends SkillRequest {
  id: number;
}

export interface ProjectRequest {
  name: string;
  description: string;
  projectUrl: string;
  repositoryUrl: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}

export interface ProjectResponse extends ProjectRequest {
  id: number;
}

export interface CVRequest {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  summary: string;
  linkedinUrl: string;
  githubUrl: string;
}

export interface CVResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  summary: string;
  linkedinUrl: string;
  githubUrl: string;
  education: EducationResponse[];
  experience: ExperienceResponse[];
  projects: ProjectResponse[];
  skills: SkillResponse[];
  createdAt: string;
  profilePhotoUrl?: string;
  pdfUrl?: string;
}

export interface UploadResponse {
  url: string;
  publicId?: string;
}
