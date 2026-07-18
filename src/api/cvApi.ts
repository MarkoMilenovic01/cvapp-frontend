import {
  apiMultipartRequest,
  apiRequest,
} from "./apiClient";
import type {
  CVRequest,
  CVResponse,
  EducationRequest,
  EducationResponse,
  ExperienceRequest,
  ExperienceResponse,
  ProjectRequest,
  ProjectResponse,
  SkillRequest,
  SkillResponse,
  UploadResponse,
} from "../types/cv";


// CV profile

export function getMyCV(): Promise<CVResponse> {
  return apiRequest<CVResponse>("/api/user/cv", {
    method: "GET",
  });
}

export function saveCV(request: CVRequest): Promise<CVResponse> {
  return apiRequest<CVResponse>("/api/user/cv", {
    method: "PUT",
    body: request,
  });
}

export function deleteCV(): Promise<void> {
  return apiRequest<void>("/api/user/cv", {
    method: "DELETE",
  });
}

// Education

export function getEducation(): Promise<EducationResponse[]> {
  return apiRequest<EducationResponse[]>("/api/user/cv/education", {
    method: "GET",
  });
}

export function addEducation(
  request: EducationRequest
): Promise<EducationResponse> {
  return apiRequest<EducationResponse>("/api/user/cv/education", {
    method: "POST",
    body: request,
  });
}

export function updateEducation(
  id: number,
  request: EducationRequest
): Promise<EducationResponse> {
  return apiRequest<EducationResponse>(`/api/user/cv/education/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteEducation(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/education/${id}`, {
    method: "DELETE",
  });
}

// Experience

export function getExperience(): Promise<ExperienceResponse[]> {
  return apiRequest<ExperienceResponse[]>("/api/user/cv/experience", {
    method: "GET",
  });
}

export function addExperience(
  request: ExperienceRequest
): Promise<ExperienceResponse> {
  return apiRequest<ExperienceResponse>("/api/user/cv/experience", {
    method: "POST",
    body: request,
  });
}

export function updateExperience(
  id: number,
  request: ExperienceRequest
): Promise<ExperienceResponse> {
  return apiRequest<ExperienceResponse>(`/api/user/cv/experience/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteExperience(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/experience/${id}`, {
    method: "DELETE",
  });
}

// Projects

export function addProject(request: ProjectRequest): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>("/api/user/cv/projects", {
    method: "POST",
    body: request,
  });
}

export function updateProject(
  id: number,
  request: ProjectRequest,
): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>(`/api/user/cv/projects/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteProject(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/projects/${id}`, {
    method: "DELETE",
  });
}

// Skills

export function getSkills(): Promise<SkillResponse[]> {
  return apiRequest<SkillResponse[]>("/api/user/cv/skills", {
    method: "GET",
  });
}

export function addSkill(request: SkillRequest): Promise<SkillResponse> {
  return apiRequest<SkillResponse>("/api/user/cv/skills", {
    method: "POST",
    body: request,
  });
}

export function updateSkill(
  id: number,
  request: SkillRequest
): Promise<SkillResponse> {
  return apiRequest<SkillResponse>(`/api/user/cv/skills/${id}`, {
    method: "PUT",
    body: request,
  });
}

export function deleteSkill(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/cv/skills/${id}`, {
    method: "DELETE",
  });
}

// Uploads

export function uploadCVPhoto(file: File): Promise<UploadResponse> {
  return apiMultipartRequest<UploadResponse>(
    "/api/user/cv/photo",
    file
  );
}

export function deleteCVPhoto(): Promise<void> {
  return apiRequest<void>("/api/user/cv/photo", {
    method: "DELETE",
  });
}

export function uploadCVPdf(file: File): Promise<UploadResponse> {
  return apiMultipartRequest<UploadResponse>(
    "/api/user/cv/pdf",
    file
  );
}

export function deleteCVPdf(): Promise<void> {
  return apiRequest<void>("/api/user/cv/pdf", {
    method: "DELETE",
  });
}
