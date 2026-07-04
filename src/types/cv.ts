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
  description: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
}

export interface ExperienceResponse extends ExperienceRequest {
  id: number;
}

export interface SkillRequest {
  name: string;
  level: string;
}

export interface SkillResponse extends SkillRequest {
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
  education: EducationRequest[];
  experience: ExperienceRequest[];
  skills: SkillRequest[];
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
  skills: SkillResponse[];
  createdAt: string;
  profilePhotoUrl?: string;
  pdfUrl?: string;
}

export interface UploadResponse {
  url: string;
  publicId?: string;
}